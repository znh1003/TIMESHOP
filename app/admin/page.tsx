"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default function AdminHomePage() {
  const [state, setState] = useState<{ orders: Array<{ order_number: string; customer_name: string | null; total: number; order_status: string | null }>; products: Array<{ id: string; name: string; stock: string | null; inventory_quantity: number | null; price: number; featured: boolean; is_published: boolean }>; refunds: Array<{ refund_amount: number | null }>; customerCount: number }>({ orders: [], products: [], refunds: [], customerCount: 0 });
  const [error, setError] = useState("");

  useEffect(() => {
    void fetch("/api/admin?resource=dashboard")
      .then(async (response) => {
        const data = await response.json() as typeof state & { error?: string };
        if (!response.ok) throw new Error(data.error ?? "No se pudo cargar el panel.");
        setState(data);
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el panel."));
  }, []);

  const totalRevenue = state.orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = state.orders.filter((order) => order.order_status === "Pendiente").length;
  const totalRefunds = state.refunds.reduce((sum, refund) => sum + Number(refund.refund_amount ?? 0), 0);
  const lowStockProducts = state.products.filter((product) => product.is_published && (product.inventory_quantity ?? 0) <= 5);

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
          <strong>{state.customerCount}</strong>
        </div>
        <div className="stats-card">
          <span>Reembolsos</span>
          <strong>{formatPrice(totalRefunds)}</strong>
        </div>
        <div className="stats-card">
          <span>Stock bajo</span>
          <strong>{lowStockProducts.length}</strong>
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
                  <tr key={order.order_number}>
                    <td>{order.order_number}</td>
                    <td>{order.customer_name ?? "Cliente"}</td>
                    <td>{formatPrice(order.total)}</td>
                    <td><span className="status-pill status-pill--neutral">{order.order_status ?? "Pendiente"}</span></td>
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

        <section className="admin-panel">
          <h3>Reposición requerida</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Unidades</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.slice(0, 4).map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.inventory_quantity ?? 0}</td>
                    <td><span className="status-pill status-pill--neutral">{product.inventory_quantity === 0 ? "Agotado" : "Pocas unidades"}</span></td>
                  </tr>
                ))}
                {lowStockProducts.length === 0 ? <tr><td colSpan={3}>No hay productos con stock bajo.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      {error ? <p className="error-box">{error}</p> : null}
    </div>
  );
}
