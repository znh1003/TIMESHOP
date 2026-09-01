export const dynamic = "force-dynamic";

export default function AccountSettingsPage() {
  return (
    <div className="container-shell" style={{ padding: "24px 0 40px" }}>
      <div className="page-hero">
        <h1>Datos personales</h1>
        <p>Actualiza tus datos básicos y preferencias de contacto.</p>
      </div>

      <div className="form-card" style={{ maxWidth: 640 }}>
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
        <button className="primary-button" style={{ width: "100%" }}>Guardar cambios</button>
      </div>
    </div>
  );
}
