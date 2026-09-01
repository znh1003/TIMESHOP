export default function ContactPage() {
  return (
    <div className="container-shell" style={{ padding: "24px 0 40px" }}>
      <div className="page-hero">
        <h1>Contacto</h1>
        <p>¿Tienes alguna pregunta? Escríbenos por WhatsApp.</p>
      </div>

      <div className="form-card" style={{ maxWidth: 680, margin: "0 auto" }}>
        <div className="field">
          <label>Nombre</label>
          <input defaultValue="Ana" />
        </div>
        <div className="field">
          <label>Email</label>
          <input type="email" defaultValue="ana@email.com" />
        </div>
        <div className="field">
          <label>Mensaje</label>
          <textarea rows={5} defaultValue="Quisiera saber más sobre la entrega y disponibilidad del producto." />
        </div>
        <button className="primary-button" style={{ width: "100%" }}>Enviar mensaje</button>
      </div>
    </div>
  );
}
