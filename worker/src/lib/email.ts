import { sql } from "drizzle-orm";
import { siteSettings } from "../db/schema";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export async function getResendApiKey(env: any, db?: any): Promise<string | null> {
  if (env?.RESEND_API_KEY && env.RESEND_API_KEY.trim()) {
    return env.RESEND_API_KEY.trim();
  }
  if (db) {
    try {
      const [resendRow] = await db
        .select()
        .from(siteSettings)
        .where(sql`key = 'resend_api_key'`)
        .limit(1);
      if (resendRow?.value) return resendRow.value.trim();
    } catch {}
  }
  return null;
}

export async function getContactEmail(env: any, db?: any): Promise<string> {
  if (env?.CONTACT_EMAIL && env.CONTACT_EMAIL.trim()) {
    return env.CONTACT_EMAIL.trim();
  }
  if (db) {
    try {
      const [contactRow] = await db
        .select()
        .from(siteSettings)
        .where(sql`key = 'contact_email'`)
        .limit(1);
      if (contactRow?.value) return contactRow.value.trim();
    } catch {}
  }
  return "onurdrsn55@gmail.com";
}

export async function sendEmail(
  options: SendEmailOptions,
  env: any,
  db?: any
): Promise<{ success: boolean; id?: string; error?: string }> {
  const apiKey = await getResendApiKey(env, db);

  if (!apiKey) {
    console.warn("[Email Service] RESEND_API_KEY is not configured!");
    return {
      success: false,
      error: "RESEND_API_KEY yapılandırılmamış. Lütfen Cloudflare ortam değişkenlerinden veya admin panelinden Resend API anahtarınızı tanımlayın.",
    };
  }

  // Resend requires a verified sender or the default sandbox sender
  const from = options.from || env?.RESEND_FROM || "Onur Dursun Portfolio <onboarding@resend.dev>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
      }),
    });

    const data: any = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("[Email Service] Resend error:", data);
      return {
        success: false,
        error: data.message || "E-posta gönderimi başarısız oldu.",
      };
    }

    return { success: true, id: data.id };
  } catch (err: any) {
    console.error("[Email Service] Network/Fetch error:", err);
    return {
      success: false,
      error: err.message || "E-posta sunucusuna ulaşılamadı.",
    };
  }
}

export async function sendPasscodeEmail(params: {
  email: string;
  userName?: string;
  code: string;
  resendApiKey?: string;
  env?: any;
  db?: any;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const env = params.env || (params.resendApiKey ? { RESEND_API_KEY: params.resendApiKey } : {});
  const userName = params.userName || "Kullanıcı";
  const html = generateOtpEmailHtml(userName, params.code);
  const text = `Sistemimize Hoş Geldiniz ${userName}, Parolanız: ${params.code} * Bu parola giriş yapılana kadar 10 dakika boyunca geçerlidir.`;

  const result = await sendEmail(
    {
      to: params.email,
      subject: `🔐 Giriş Doğrulama Kodunuz: ${params.code} — Onur Dursun Portfolio`,
      html,
      text,
    },
    env,
    params.db
  );

  return {
    success: result.success,
    messageId: result.id,
    error: result.error,
  };
}

export async function sendContactNotificationEmail(params: {
  name: string;
  email: string;
  subject?: string;
  message: string;
  resendApiKey?: string;
  targetEmail?: string;
  env?: any;
  db?: any;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const env = params.env || (params.resendApiKey ? { RESEND_API_KEY: params.resendApiKey } : {});
  const html = generateContactEmailHtml(params.name, params.email, params.message);
  const targetEmail = params.targetEmail || (await getContactEmail(env, params.db));

  const result = await sendEmail(
    {
      to: targetEmail,
      subject: `📩 Yeni İletişim Mesajı: ${params.name} — ${params.subject || "Portfolyo"}`,
      html,
      text: `Gönderen: ${params.name} (${params.email})\n\nMesaj:\n${params.message}`,
    },
    env,
    params.db
  );

  return {
    success: result.success,
    messageId: result.id,
    error: result.error,
  };
}

export function generateOtpEmailHtml(userName: string, code: string): string {
  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>Giriş Parolanız</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f4f6;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="min-width: 100%; background-color: #0b0f19; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background: linear-gradient(145deg, #131b2e 0%, #0d121f 100%); border: 1px solid #1f293d; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);">
          <!-- Header Banner -->
          <tr>
            <td style="padding: 36px 36px 20px 36px; text-align: center; border-bottom: 1px solid #1a2236;">
              <div style="display: inline-block; width: 56px; height: 56px; line-height: 56px; border-radius: 16px; background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); font-size: 26px; box-shadow: 0 8px 24px rgba(124, 58, 237, 0.4);">
                ✨
              </div>
              <h1 style="margin: 18px 0 6px 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                Onur Dursun Portfolio
              </h1>
              <p style="margin: 0; font-size: 13px; color: #818cf8; font-weight: 500;">
                Tek Kullanımlık Güvenli Giriş Doğrulaması
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 36px;">
              <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 24px; color: #e2e8f0; font-weight: 600;">
                Sistemimize Hoş Geldiniz <span style="color: #a78bfa;">${userName}</span>,
              </p>
              <p style="margin: 0 0 26px 0; font-size: 14px; line-height: 22px; color: #94a3b8;">
                Portfolyo ve yönetim sistemine erişim sağlamak için talep ettiğiniz tek kullanımlık geçici parolanız aşağıdadır:
              </p>

              <!-- Passcode Display Box -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 0 0 26px 0;">
                <tr>
                  <td align="center" style="background: #181d30; border: 2px dashed #7c3aed; border-radius: 16px; padding: 22px 10px;">
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #a5b4fc; font-weight: 700; margin-bottom: 8px;">
                      Giriş Parolanız
                    </div>
                    <div style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #ffffff; text-shadow: 0 0 20px rgba(167, 139, 250, 0.6); padding-left: 8px;">
                      ${code}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Expiry Alert -->
              <div style="background: rgba(124, 58, 237, 0.08); border-left: 3px solid #8b5cf6; padding: 14px 16px; border-radius: 0 10px 10px 0; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 13px; line-height: 20px; color: #cbd5e1; font-weight: 500;">
                  <strong style="color: #c084fc;">* Bu parola giriş yapılana kadar 10 dakika boyunca geçerlidir.</strong><br/>
                  Giriş yaptıktan sonra veya yeni bir kod istediğinizde otomatik olarak geçersiz kılınır.
                </p>
              </div>

              <p style="margin: 0; font-size: 12px; line-height: 18px; color: #64748b;">
                Eğer bu giriş talebini siz gerçekleştirmediyseniz bu e-postayı güvenle göz ardı edebilirsiniz.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 36px 28px 36px; text-align: center; border-top: 1px solid #1a2236; background-color: #0d121f;">
              <p style="margin: 0; font-size: 11px; color: #64748b; line-height: 16px;">
                © 2026 Onur Dursun • Full Stack Software Engineer<br/>
                <a href="https://onurd.com.tr" style="color: #818cf8; text-decoration: none;">onurd.com.tr</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

export function generateContactEmailHtml(name: string, email: string, message: string): string {
  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>Yeni İletişim Mesajı</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f4f6;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #131b2e; border: 1px solid #1f293d; border-radius: 20px; padding: 32px;">
          <tr>
            <td>
              <h2 style="margin: 0 0 12px 0; color: #a78bfa; font-size: 20px;">📩 Yeni İletişim Formu Mesajı</h2>
              <p style="margin: 0 0 20px 0; color: #94a3b8; font-size: 14px;">Web sitenizdeki iletişim formundan yeni bir mesaj alındı:</p>
              
              <div style="background: #0d121f; border: 1px solid #1e293b; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #e2e8f0;"><strong>Gönderen:</strong> ${name}</p>
                <p style="margin: 0; font-size: 14px; color: #e2e8f0;"><strong>E-posta:</strong> <a href="mailto:${email}" style="color: #818cf8;">${email}</a></p>
              </div>

              <div style="background: #181d30; border-left: 4px solid #7c3aed; border-radius: 8px; padding: 18px; margin-bottom: 24px;">
                <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #a5b4fc;">Mesaj:</p>
                <p style="margin: 0; font-size: 14px; line-height: 22px; color: #f8fafc; white-space: pre-wrap;">${message}</p>
              </div>

              <a href="mailto:${email}?subject=RE: Portfolyo İletişim Mesajınız" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); color: #ffffff; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-size: 13px; font-weight: 700;">
                Bu Mesajı Yanıtla
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}
