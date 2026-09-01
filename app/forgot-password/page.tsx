export default function ForgotPasswordPage() {
  return (
    <div className="container-shell" style={{ padding: "24px 0 40px" }}>
      <div className="page-hero">
        <h1>Recuperar contraseña</h1>
        <p>Te enviaremos un enlace para restablecer tu acceso.</p>
      </div>

      <div className="form-card" style={{ maxWidth: 540, margin: "0 auto" }}>
        <div className="field">
          <label>Email</label>
          <input type="email" defaultValue="ana@email.com" />
        </div>
        <button className="primary-button" style={{ width: "100%" }}>Enviar enlace</button>
      </div>
    </div>
  );
}
