"use client";

import { useEffect, useState } from "react";
import { formatPrice, getAdminState } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default function AdminOrdersPage() {
  const [state, setState] = useState(getAdminState());

  useEffect(() => {
    setState(getAdminState());
  }, []);

  return (
    <div>
      <div className="page-hero">
        <h1>Pedidos</h1>
        <p>Revisa pagos, envío, clientes y seguimiento de cada compra.</p>
      </div>

      <div className="admin-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Email</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {state.orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.customer}</td>
                  <td>{order.email}</td>
                  <td>{formatPrice(order.total)}</td>
                  <td><span className="status-pill">{order.status}</span></td>
                  <td>{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
