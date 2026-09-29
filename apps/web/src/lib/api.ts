import React from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8787";

export interface ApiOptions extends RequestInit {
  silent?: boolean;
}

export async function apiFetch(path: string, options: ApiOptions = {}): Promise<Response> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    return await fetch(`${BASE}${path}`, { ...options, headers, credentials: "include" });
  } catch (err: any) {
    if (err.message?.includes("fetch") || err.message?.includes("Failed to fetch")) {
      const msg = "Sunucuya ulaşılamıyor. Lütfen internet bağlantınızı kontrol edin.";
      if (!options.silent) toast.error(msg, { id: "network_err" });
      throw new Error(msg);
    }
    if (!options.silent) toast.error("Beklenmeyen bir hata meydana geldi.");
    throw err;
  }
}

async function handleResponse<T>(res: Response, silent = false, isGet = false): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    let msg = err.error || "Sunucu işlem sırasında bir sorun yaşadı.";
    
    if (res.status === 401) msg = "Oturumunuz geçersiz veya zaman aşımına uğramış olabilir.";
    else if (res.status === 403) msg = "Bu işlemi yapmaya yetkiniz bulunmuyor.";
    else if (res.status === 404) msg = "Aradığınız içerik/veri bulunamadı.";
    else if (res.status >= 500) msg = "Sunucumuz geçici bir hata verdi, yöneticiler uyarılıyor.";

    // Do NOT show error toast pop-ups for 404/401 errors, or GET fetches, or silent requests
    if (!silent && !isGet && res.status !== 404 && res.status !== 401) {
      toast.error(msg, { id: "api_global_error" });
    }
    throw new Error(msg);
  }
  return res.json();
}

export async function apiGet<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const res = await apiFetch(path, { method: "GET", ...options });
  return handleResponse<T>(res, options.silent ?? true, true);
}

export async function apiPost<T>(path: string, body: unknown, options: ApiOptions = {}): Promise<T> {
  const res = await apiFetch(path, { method: "POST", body: JSON.stringify(body), ...options });
  return handleResponse<T>(res, options.silent);
}

export async function apiPut<T>(path: string, body: unknown, options: ApiOptions = {}): Promise<T> {
  const res = await apiFetch(path, { method: "PUT", body: JSON.stringify(body), ...options });
  return handleResponse<T>(res, options.silent);
}

export async function apiPatch<T>(path: string, body?: unknown, options: ApiOptions = {}): Promise<T> {
  const res = await apiFetch(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined, ...options });
  return handleResponse<T>(res, options.silent);
}

export async function apiDelete<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const res = await apiFetch(path, { method: "DELETE", ...options });
  return handleResponse<T>(res, options.silent);
}

/**
 * Custom Toast Confirmation Dialog rendered in the EXACT CENTER of the screen via Portal
 */
export function confirmToast(message: string, onConfirm: () => void, confirmText = "Evet, Sil") {
  toast.custom((t) => createPortal(
    React.createElement("div", {
      className: `fixed inset-0 z-[99999] w-screen h-screen flex items-center justify-center bg-black/75 backdrop-blur-md p-4 transition-all duration-300 ${t.visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`
    },
      React.createElement("div", { className: "relative bg-[#0d1117] border border-[#1a2035] rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4 animate-fadeIn" },
        React.createElement("div", { className: "w-12 h-12 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center mx-auto text-xl font-bold" }, "⚠️"),
        React.createElement("p", { className: "text-sm font-semibold text-white leading-relaxed" }, message),
        React.createElement("div", { className: "flex items-center justify-center gap-3 pt-2" },
          React.createElement("button", {
            onClick: () => toast.dismiss(t.id),
            className: "flex-1 px-4 py-2 text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-all cursor-pointer"
          }, "İptal"),
          React.createElement("button", {
            onClick: () => {
              toast.dismiss(t.id);
              onConfirm();
            },
            className: "flex-1 px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-lg shadow-red-900/40 transition-all cursor-pointer"
          }, confirmText)
        )
      )
    ),
    document.body
  ), { duration: 20000 });
}
