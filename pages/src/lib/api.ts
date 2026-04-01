import toast from "react-hot-toast";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8787";

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    return await fetch(`${BASE}${path}`, { ...options, headers });
  } catch (err: any) {
    if (err.message.includes("fetch") || err.message.includes("Failed to fetch")) {
      const msg = "Sunucuya ulaşılamıyor. Lütfen internet bağlantınızı kontrol edin.";
      toast.error(msg, { id: "network_err" }); // Prevent multiple toasts
      throw new Error(msg);
    }
    toast.error("Beklenmeyen bir hata meydana geldi.");
    throw err;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    let msg = err.error || "Sunucu işlem sırasında bir sorun yaşadı.";
    
    if (res.status === 401) msg = "Oturumunuz geçersiz veya zaman aşımına uğramış olabilir.";
    else if (res.status === 403) msg = "Bu işlemi yapmaya yetkiniz bulunmuyor.";
    else if (res.status === 404) msg = "Aradığınız içerik/veri bulunamadı.";
    else if (res.status >= 500) msg = "Sunucumuz geçici bir hata verdi, yöneticiler uyarılıyor.";

    toast.error(msg);
    throw new Error(msg);
  }
  return res.json();
}

export async function apiGet<T>(path: string): Promise<T> {
  return handleResponse<T>(await apiFetch(path, { method: "GET" }));
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  return handleResponse<T>(await apiFetch(path, { method: "POST", body: JSON.stringify(body) }));
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  return handleResponse<T>(await apiFetch(path, { method: "PUT", body: JSON.stringify(body) }));
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  return handleResponse<T>(await apiFetch(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }));
}

export async function apiDelete<T>(path: string): Promise<T> {
  return handleResponse<T>(await apiFetch(path, { method: "DELETE" }));
}
