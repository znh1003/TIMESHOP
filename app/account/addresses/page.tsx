export const dynamic = "force-dynamic";

export default function AddressesPage() {
  return (
    <div className="container-shell" style={{ padding: "24px 0 40px" }}>
      <div className="page-hero">
        <h1>Mis direcciones</h1>
        <p>Gestiona tus ubicaciones de entrega para futuras compras.</p>
      </div>

      <div className="list">
        <div className="form-card">
          <div className="meta-row"><span>Casa</span><span>Roma Norte, CDMX</span></div>
          <div className="meta-row"><span>Oficina</span><span>Condesa, CDMX</span></div>
        </div>
      </div>
    </div>
  );
}
