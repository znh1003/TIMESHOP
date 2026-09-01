"use client";

import { useEffect, useState } from "react";
import { getAdminState } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default function AdminReturnsPage() {
  const [state, setState] = useState(getAdminState());

  useEffect(() => {
    setState(getAdminState());
  }, []);

  return (
    <div>
      <div className="page-hero">
        <h1>Devoluciones</h1>
        <p>Revisa solicitudes, motivos y documentación de clientes.</p>
      </div>

      <div className="admin-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Motivo</th>
                <th>Estado</th>
                <th>Pedido</th>
              </tr>
            </thead>
            <tbody>
              {state.returns.map((returnItem) => (
                <tr key={returnItem.id}>
                  <td>{returnItem.id}</td>
                  <td>{returnItem.customer}</td>
                  <td>{returnItem.reason}</td>
                  <td><span className="status-pill">{returnItem.status}</span></td>
                  <td>{returnItem.orderId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
