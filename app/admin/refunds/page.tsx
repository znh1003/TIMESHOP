"use client";

import { useEffect, useState } from "react";
import { formatPrice, getAdminState } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default function AdminRefundsPage() {
  const [state, setState] = useState(getAdminState());

  useEffect(() => {
    setState(getAdminState());
  }, []);

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
              </tr>
            </thead>
            <tbody>
              {state.refunds.map((refund) => (
                <tr key={refund.id}>
                  <td>{refund.id}</td>
                  <td>{refund.customer}</td>
                  <td>{formatPrice(refund.amount)}</td>
                  <td><span className="status-pill">{refund.status}</span></td>
                  <td>{refund.orderId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
