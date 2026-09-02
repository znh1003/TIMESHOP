export default function ContactPage() {
  return (
    <div className="container-shell" style={{ padding: "24px 0 40px" }}>
      <div className="page-hero">
        <span className="eyebrow subdued">CUSTOMER CARE</span>
        <h1>We are here to help.</h1>
        <p>Questions about an order, a product, or delivery? Our team will get back to you within one business day.</p>
      </div>

      <div className="contact-layout">
      <div className="form-card">
        <div className="field">
          <label>Name</label><input placeholder="Your name" />
        </div>
        <div className="field">
          <label>Email</label><input type="email" placeholder="you@email.com" />
        </div>
        <div className="field">
          <label>How can we help?</label><textarea rows={5} placeholder="Tell us about your question or order." />
        </div>
        <button className="primary-button" style={{ width: "100%" }}>Send message</button>
      </div>
      <div className="contact-info"><h2>Order help</h2><p>Email: care@timeshop.mx</p><p>WhatsApp: +52 55 1234 5678</p><p>Monday–Friday, 9:00–18:00 CST</p><details><summary>Shipping questions</summary><p>See our shipping and returns information for delivery times and order support.</p></details><details><summary>Returns and exchanges</summary><p>Our support team can guide you through an eligible return.</p></details></div>
      </div>
    </div>
  );
}
