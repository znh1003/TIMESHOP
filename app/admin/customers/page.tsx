"use client";

import { startTransition, useEffect, useState } from "react";
import { formatPrice, getAdminState } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default function AdminCustomersPage() {
  const [state, setState] = useState(getAdminState());

  useEffect(() => {
    startTransition(() => setState(getAdminState()));
  }, []);

  return (
    <div>
      <div className="page-hero">
        <h1>Clientes</h1>
        <p>Historial de clientes, compras y ubicación para ventas personalizadas.</p>
      </div>

      <div className="admin-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Ciudad</th>
                <th>Tickets</th>
                <th>Gasto total</th>
              </tr>
            </thead>
            <tbody>
              {state.customers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.city}</td>
                  <td>{customer.orders}</td>
                  <td>{formatPrice(customer.totalSpent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
