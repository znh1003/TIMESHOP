export const dynamic = "force-dynamic";

export default function OrderDetailPage() {
  return (
    <div className="container-shell" style={{ padding: "24px 0 40px" }}>
      <div className="page-hero">
        <h1>Pedido #1042</h1>
        <p>Preparando · En tránsito · Entregado</p>
      </div>

      <div className="form-card" style={{ maxWidth: 700 }}>
        <div className="meta-row"><span>Estado</span><span>Pago confirmado</span></div>
        <div className="meta-row"><span>Total</span><span>$2,298 MXN</span></div>
        <div className="meta-row"><span>Envío</span><span>Correos de México</span></div>
        <div className="meta-row"><span>Tracking</span><span>MX123456789</span></div>
      </div>
    </div>
  );
}
