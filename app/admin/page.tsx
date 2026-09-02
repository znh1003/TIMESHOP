"use client";

import { startTransition, useEffect, useState } from "react";
import { formatPrice, getAdminState } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default function AdminHomePage() {
  const [state, setState] = useState(getAdminState());

  useEffect(() => {
    startTransition(() => setState(getAdminState()));
  }, []);

  const totalRevenue = state.orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = state.orders.filter((order) => order.status === "Pendiente").length;
  const totalRefunds = state.refunds.reduce((sum, refund) => sum + refund.amount, 0);

  return (
    <div>
      <div className="page-hero">
        <h1>Dashboard</h1>
        <p>Resumen del negocio, pedidos, clientes y rendimiento de tu tienda.</p>
      </div>

      <div className="admin-stats">
        <div className="stats-card">
          <span>Ingresos</span>
          <strong>{formatPrice(totalRevenue)}</strong>
        </div>
        <div className="stats-card">
          <span>Pedidos pendientes</span>
          <strong>{pendingOrders}</strong>
        </div>
        <div className="stats-card">
          <span>Clientes activos</span>
          <strong>{state.customers.length}</strong>
        </div>
        <div className="stats-card">
          <span>Reembolsos</span>
          <strong>{formatPrice(totalRefunds)}</strong>
        </div>
      </div>

      <div className="admin-panels">
        <section className="admin-panel">
          <h3>Pedidos recientes</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {state.orders.slice(0, 4).map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.customer}</td>
                    <td>{formatPrice(order.total)}</td>
                    <td><span className="status-pill status-pill--neutral">{order.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-panel">
          <h3>Productos destacados</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Stock</th>
                  <th>Precio</th>
                </tr>
              </thead>
              <tbody>
                {state.products.filter((product) => product.featured).slice(0, 4).map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.stock}</td>
                    <td>{formatPrice(product.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
