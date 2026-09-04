"use client";

import { FormEvent, useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus("");
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json() as { message?: string; error?: string };
      if (!response.ok) throw new Error(data.error ?? "No se pudo enviar tu mensaje.");
      setStatus(data.message ?? "Recibimos tu mensaje.");
      setForm({ name: "", email: "", message: "" });
    } catch (submitError) {
      setStatus(submitError instanceof Error ? submitError.message : "No se pudo enviar tu mensaje.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-shell" style={{ padding: "24px 0 40px" }}>
      <div className="page-hero">
        <span className="eyebrow subdued">CUSTOMER CARE</span>
        <h1>We are here to help.</h1>
        <p>Questions about an order, a product, or delivery? Our team will get back to you within one business day.</p>
      </div>

      <div className="contact-layout">
      <form className="form-card" onSubmit={submit}>
        <div className="field">
          <label>Name</label><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Your name" required minLength={2} maxLength={120} />
        </div>
        <div className="field">
          <label>Email</label><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@email.com" required />
        </div>
        <div className="field">
          <label>How can we help?</label><textarea rows={5} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="Tell us about your question or order." required minLength={10} maxLength={4000} />
        </div>
        <button className="primary-button" style={{ width: "100%" }} disabled={submitting}>{submitting ? "Sending..." : "Send message"}</button>
        {status ? <p className={status.includes("Recibimos") ? "success-box" : "error-box"}>{status}</p> : null}
      </form>
      <div className="contact-info"><h2>Order help</h2><p>Email: zhengnanhao759@gmail.com</p><p>WhatsApp: +86 178 2047 9265</p><p>Monday–Friday, 9:00–18:00 CST</p><details><summary>Shipping questions</summary><p>See our shipping and returns information for delivery times and order support.</p></details><details><summary>Returns and exchanges</summary><p>Our support team can guide you through an eligible return.</p></details></div>
      </div>
    </div>
  );
}
