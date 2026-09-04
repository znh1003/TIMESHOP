"use client";

import { formatPrice } from "@/lib/admin-data";
import { useAdminResource } from "@/components/admin-data-loader";

export const dynamic = "force-dynamic";

export default function AdminRefundsPage() {
  const { items: refunds, loading, error } = useAdminResource<{ id: string; order_id: string; refund_amount: number; refund_status: string | null; refund_reason: string | null; orders: { customer_name: string | null; guest_email: string | null; order_number: string | null } | null; returns: Array<{ reason: string | null }> | null }>("refunds");

  return (
    <div>
      <div className="page-hero">
        <h1>Refunds</h1>
        <p>Gestiona reembolsos y validación con PayPal.</p>
      </div>

      <div className="admin-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Pedido</th>
                <th>Motivo</th>
              </tr>
            </thead>
            <tbody>
              {refunds.map((refund) => (
                <tr key={refund.id}>
                  <td>{refund.id.slice(0, 8)}</td>
                  <td>{refund.orders?.customer_name ?? refund.orders?.guest_email ?? "-"}</td>
                  <td>{formatPrice(refund.refund_amount)}</td>
                  <td><span className="status-pill">{refund.refund_status ?? "Pendiente"}</span></td>
                  <td>{refund.orders?.order_number ?? refund.order_id.slice(0, 8)}</td>
                  <td>{refund.refund_reason ?? refund.returns?.[0]?.reason ?? "-"}</td>
                </tr>
              ))}
              {!loading && refunds.length === 0 ? <tr><td colSpan={6}>No hay reembolsos registrados.</td></tr> : null}
            </tbody>
          </table>
        </div>
        {error ? <p className="error-box">{error}</p> : null}
      </div>
    </div>
  );
}
