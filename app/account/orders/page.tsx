import Link from "next/link";

export const dynamic = "force-dynamic";

export default function OrdersPage() {
  return (
    <div className="container-shell" style={{ padding: "24px 0 40px" }}>
      <div className="page-hero">
        <h1>Mis pedidos</h1>
        <p>Consulta el estado de cada compra.</p>
      </div>

      <div className="list">
        <div className="form-card">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <div>
              <strong>Pedido #1042</strong>
              <div className="muted">Pago confirmado</div>
            </div>
            <Link href="/account/orders/1042" className="ghost-button">Ver</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
