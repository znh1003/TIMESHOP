"use client";

import { useSyncExternalStore } from "react";

const subscribe = (onStoreChange: () => void) => {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("timeshop:cookie-choice", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("timeshop:cookie-choice", onStoreChange);
  };
};

const getSnapshot = () => window.localStorage.getItem("timeshop_cookie_consent") === "true";
const getServerSnapshot = () => true;

export function CookieConsent() {
  const hasConsent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const choose = (value: string) => {
    window.localStorage.setItem("timeshop_cookie_consent", "true");
    window.dispatchEvent(new CustomEvent("timeshop:cookie-choice", { detail: value }));
  };
  if (hasConsent) return null;
  return <aside className="cookie-consent" aria-label="Cookie consent"><div><strong>Privacy, with clarity.</strong><p>We use essential cookies to keep TIMESHOP working and optional cookies to understand what matters to our customers.</p></div><div className="cookie-actions"><button type="button" onClick={() => choose("accept")} className="primary-button">Accept</button><button type="button" onClick={() => choose("reject")} className="ghost-button">Reject</button><button type="button" onClick={() => choose("preferences")} className="text-button">Manage preferences</button></div></aside>;
}
