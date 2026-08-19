import type { Locale } from "@company/contracts";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
type RecaptchaPath = "homepage" | "contact" | "newsletter" | "careers" | "chat";

declare global { interface Window { grecaptcha?: { ready: (callback: () => void) => void; execute: (siteKey: string, options: { action: string }) => Promise<string> }; } }

let scriptPromise: Promise<void> | null = null;

function loadScript(siteKey: string) {
  if (window.grecaptcha) return Promise.resolve();
  if (!scriptPromise) scriptPromise = new Promise((resolve, reject) => { const script = document.createElement("script"); script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`; script.async = true; script.onload = () => resolve(); script.onerror = () => reject(new Error("reCAPTCHA unavailable")); document.head.appendChild(script); });
  return scriptPromise;
}

export async function recaptchaToken(path: RecaptchaPath, locale: Locale) {
  if (typeof window === "undefined") return undefined;
  const response = await fetch(`${API}/api/v1/public/security`, { headers: { accept: "application/json" } });
  if (!response.ok) return undefined;
  const payload = await response.json() as { data?: { recaptcha?: { enabled?: boolean; siteKey?: string; protectedPaths?: string[] } } };
  const config = payload.data?.recaptcha;
  if (!config?.enabled || !config.siteKey || !config.protectedPaths?.includes(path)) return undefined;
  await loadScript(config.siteKey);
  return new Promise<string>((resolve, reject) => window.grecaptcha?.ready(() => window.grecaptcha?.execute(config.siteKey!, { action: `${path}_${locale}` }).then(resolve, reject)));
}
