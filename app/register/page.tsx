import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="container-shell" style={{ padding: "24px 0 40px" }}>
      <div className="page-hero">
        <h1>Crear cuenta</h1>
      </div>

      <div className="form-card" style={{ maxWidth: 540, margin: "0 auto" }}>
        <div className="field">
          <label>Nombre</label>
          <input defaultValue="Ana" />
        </div>
        <div className="field">
          <label>Apellido</label>
          <input defaultValue="García" />
        </div>
        <div className="field">
          <label>Email</label>
          <input type="email" defaultValue="ana@email.com" />
        </div>
        <div className="field">
          <label>Contraseña</label>
          <input type="password" defaultValue="********" />
        </div>
        <button className="primary-button" style={{ width: "100%" }}>Crear cuenta</button>
        <div style={{ marginTop: 12 }}>
          <Link href="/login" className="ghost-button" style={{ width: "100%" }}>Ya tengo cuenta</Link>
        </div>
      </div>
    </div>
  );
}
