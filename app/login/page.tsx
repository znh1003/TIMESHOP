import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="container-shell" style={{ padding: "24px 0 40px" }}>
      <div className="page-hero">
        <h1>Iniciar sesión</h1>
      </div>

      <div className="form-card" style={{ maxWidth: 540, margin: "0 auto" }}>
        <div className="field">
          <label>Email</label>
          <input type="email" defaultValue="ana@email.com" />
        </div>
        <div className="field">
          <label>Contraseña</label>
          <input type="password" defaultValue="********" />
        </div>
        <button className="primary-button" style={{ width: "100%" }}>Entrar</button>
        <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
          <Link href="/register" className="ghost-button" style={{ width: "100%" }}>Crear cuenta</Link>
          <Link href="/forgot-password" className="ghost-button" style={{ width: "100%" }}>Recuperar contraseña</Link>
        </div>
      </div>
    </div>
  );
}
