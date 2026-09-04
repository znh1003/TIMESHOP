"use client";

import { formatPrice } from "@/lib/admin-data";
import { useAdminResource } from "@/components/admin-data-loader";
import { useState } from "react";

export const dynamic = "force-dynamic";

export default function AdminOrdersPage() {
  type AdminOrder = { id: string; order_number: string; customer_name: string | null; guest_email: string | null; phone: string | null; shipping_address: { street?: string; number?: string; neighborhood?: string; city?: string; state?: string; postalCode?: string } | null; total: number; order_status: string | null; payment_status: string | null; paypal_capture_id: string | null; tracking_number: string | null; shipping_carrier: string | null; shipped_at: string | null; created_at: string };
  const { items: orders, loading, error, reload, setItems } = useAdminResource<AdminOrder>("orders");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fulfillment, setFulfillment] = useState({ status: "Procesando", carrier: "", trackingNumber: "" });
  const [fulfillmentError, setFulfillmentError] = useState("");
  const [savingFulfillment, setSavingFulfillment] = useState(false);

  const beginFulfillment = (order: AdminOrder) => {
    setEditingId(order.id);
    setFulfillmentError("");
    setFulfillment({ status: order.order_status ?? "Procesando", carrier: order.shipping_carrier ?? "", trackingNumber: order.tracking_number ?? "" });
  };

  const saveFulfillment = async (orderId: string) => {
    setSavingFulfillment(true);
    setFulfillmentError("");
    try {
      const response = await fetch("/api/admin", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resource: "orders", id: orderId, status: fulfillment.status, shippingCarrier: fulfillment.carrier, trackingNumber: fulfillment.trackingNumber }) });
      const data = await response.json() as { item?: Pick<AdminOrder, "id" | "order_status" | "shipping_carrier" | "tracking_number" | "shipped_at">; error?: string };
      if (!response.ok || !data.item) throw new Error(data.error ?? "No se pudo actualizar el envío.");
      setItems((current) => current.map((order) => order.id === orderId ? { ...order, ...data.item } : order));
      setEditingId(null);
    } catch (saveError) {
      setFulfillmentError(saveError instanceof Error ? saveError.message : "No se pudo actualizar el envío.");
    } finally {
      setSavingFulfillment(false);
    }
  };

  const refundOrder = async (order: { id: string; total: number; paypal_capture_id: string | null; payment_status: string | null }) => {
    if (!order.paypal_capture_id || order.payment_status !== "Pagado" || !window.confirm(`¿Reembolsar ${formatPrice(order.total)} a través de PayPal?`)) return;
    const response = await fetch("/api/admin/refunds", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: order.id }) });
    const data = await response.json() as { error?: string };
    if (!response.ok) { window.alert(data.error ?? "No se pudo procesar el reembolso."); return; }
    window.alert("Reembolso solicitado correctamente.");
    reload();
  };

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
                <th>Envío</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.order_number}</td>
                  <td>{order.customer_name ?? "Cliente"}</td>
                  <td>{order.guest_email ?? "-"}</td>
                  <td>{formatPrice(order.total)}</td>
                  <td>{editingId === order.id ? <select value={fulfillment.status} onChange={(event) => setFulfillment({ ...fulfillment, status: event.target.value })} aria-label="Estado del pedido"><option>Pendiente</option><option>Procesando</option><option>Enviado</option><option>Entregado</option><option>Cancelado</option></select> : <span className="status-pill">{order.order_status ?? "Pendiente"}</span>}</td>
                  <td>{new Date(order.created_at).toLocaleDateString("es-MX")}</td>
                  <td>{editingId === order.id ? <><input value={fulfillment.carrier} onChange={(event) => setFulfillment({ ...fulfillment, carrier: event.target.value })} placeholder="Paquetería" aria-label="Paquetería" /><input value={fulfillment.trackingNumber} onChange={(event) => setFulfillment({ ...fulfillment, trackingNumber: event.target.value })} placeholder="Número de guía" aria-label="Número de guía" /></> : order.tracking_number ? <>{order.shipping_carrier ?? "Paquetería"}<br />{order.tracking_number}</> : "Sin asignar"}</td>
                  <td>{editingId === order.id ? <><button className="small-button" onClick={() => saveFulfillment(order.id)} disabled={savingFulfillment}>{savingFulfillment ? "Guardando" : "Guardar envío"}</button><button className="small-button" onClick={() => setEditingId(null)} disabled={savingFulfillment}>Cancelar</button></> : <><button className="small-button" onClick={() => beginFulfillment(order)}>Gestionar envío</button>{order.payment_status === "Pagado" && order.paypal_capture_id ? <button className="small-button" onClick={() => refundOrder(order)}>Reembolsar</button> : null}</>}</td>
                </tr>
              ))}
              {!loading && orders.length === 0 ? <tr><td colSpan={8}>No hay pedidos registrados.</td></tr> : null}
            </tbody>
          </table>
        </div>
        {error ? <p className="error-box">{error}</p> : null}
        {fulfillmentError ? <p className="error-box">{fulfillmentError}</p> : null}
      </div>
    </div>
  );
}
