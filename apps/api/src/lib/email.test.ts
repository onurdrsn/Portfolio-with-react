import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendPasscodeEmail, sendContactNotificationEmail, generateOtpEmailHtml, generateContactEmailHtml } from './email';

describe('Worker Email Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateOtpEmailHtml', () => {
    it('should generate valid html with username and code', () => {
      const html = generateOtpEmailHtml('Onur', '987654');
      expect(html).toContain('Onur');
      expect(html).toContain('987654');
      expect(html).toContain('* Bu parola giriş yapılana kadar 10 dakika boyunca geçerlidir.');
    });
  });

  describe('generateContactEmailHtml', () => {
    it('should generate valid html with contact details', () => {
      const html = generateContactEmailHtml('Ahmet', 'ahmet@test.com', 'İş birliği teklifi');
      expect(html).toContain('Ahmet');
      expect(html).toContain('ahmet@test.com');
      expect(html).toContain('İş birliği teklifi');
    });
  });

  describe('sendPasscodeEmail', () => {
    it('should generate the exact Turkish email template specified in the requirements', async () => {
      let capturedBody: any = null;
      vi.stubGlobal(
        'fetch',
        vi.fn().mockImplementation(async (url, init) => {
          capturedBody = JSON.parse(init.body);
          return new Response(JSON.stringify({ id: 'resend_msg_123' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        })
      );

      const result = await sendPasscodeEmail({
        email: 'test@example.com',
        userName: 'Onur Dursun',
        code: '748291',
        resendApiKey: 're_test_key_123',
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('resend_msg_123');
      expect(capturedBody).not.toBeNull();
      expect(capturedBody.from).toBe('Onur Dursun <admin@onurd.com.tr>');
      expect(capturedBody.to).toEqual(['test@example.com']);
      expect(capturedBody.subject).toContain('Giriş Doğrulama Kodunuz: 748291');

      // Verify the mandatory requirement text
      const expectedText =
        'Sistemimize Hoş Geldiniz Onur Dursun, Parolanız: 748291 * Bu parola giriş yapılana kadar 10 dakika boyunca geçerlidir.';
      expect(capturedBody.text).toBe(expectedText);
      expect(capturedBody.html).toContain('748291');
      expect(capturedBody.html).toContain('10 dakika');
    });

    it('should use default username "Kullanıcı" if userName is empty', async () => {
      let capturedBody: any = null;
      vi.stubGlobal(
        'fetch',
        vi.fn().mockImplementation(async (url, init) => {
          capturedBody = JSON.parse(init.body);
          return new Response(JSON.stringify({ id: 'resend_msg_456' }), {
            status: 200,
          });
        })
      );

      await sendPasscodeEmail({
        email: 'user@example.com',
        code: '123456',
        resendApiKey: 're_valid_key',
      });

      const expectedText =
        'Sistemimize Hoş Geldiniz Kullanıcı, Parolanız: 123456 * Bu parola giriş yapılana kadar 10 dakika boyunca geçerlidir.';
      expect(capturedBody.text).toBe(expectedText);
    });

    it('should safely fall back in dev when RESEND_API_KEY is not configured', async () => {
      const result = await sendPasscodeEmail({
        email: 'dev@local.test',
        code: '654321',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('RESEND_API_KEY');
    });

    it('should handle Resend API failure gracefully', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          new Response(JSON.stringify({ message: 'Invalid API key' }), {
            status: 401,
          })
        )
      );

      const result = await sendPasscodeEmail({
        email: 'user@test.com',
        code: '111222',
        resendApiKey: 're_bad_key',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid API key');
    });
  });

  describe('sendContactNotificationEmail', () => {
    it('should send contact message notification with sender details and message body', async () => {
      let capturedBody: any = null;
      vi.stubGlobal(
        'fetch',
        vi.fn().mockImplementation(async (url, init) => {
          capturedBody = JSON.parse(init.body);
          return new Response(JSON.stringify({ id: 'contact_msg_789' }), {
            status: 200,
          });
        })
      );

      const result = await sendContactNotificationEmail({
        name: 'Jane Doe',
        email: 'jane@client.com',
        subject: 'Proje Teklifi',
        message: 'Merhaba, portfolyonuzu inceledim ve birlikte çalışmak isterim.',
        resendApiKey: 're_contact_key',
        targetEmail: 'owner@onurdursun.com',
      });

      expect(result.success).toBe(true);
      expect(capturedBody.to).toEqual(['owner@onurdursun.com']);
      expect(capturedBody.html).toContain('Jane Doe');
      expect(capturedBody.html).toContain('jane@client.com');
      expect(capturedBody.subject).toContain('Proje Teklifi');
      expect(capturedBody.html).toContain(
        'Merhaba, portfolyonuzu inceledim ve birlikte çalışmak isterim.'
      );
    });
  });
});
