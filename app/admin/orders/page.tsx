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
  const [detail, setDetail] = useState<{ id: string; order_number: string; customer_name: string | null; guest_email: string | null; phone: string | null; shipping_address: AdminOrder["shipping_address"]; total: number; payment_status: string | null; paypal_order_id: string | null; paypal_capture_id: string | null; items: Array<{ id: string; product_name: string | null; price: number | null; quantity: number | null }>; returns: Array<{ id: string; reason: string | null; description: string | null; status: string | null; created_at: string; restocked_at: string | null }>; refunds: Array<{ id: string; refund_amount: number | null; refund_status: string | null; refund_reason: string | null; refund_date: string | null; created_at: string }> } | null>(null);
  const [detailError, setDetailError] = useState("");
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [refundError, setRefundError] = useState("");
  const [refunding, setRefunding] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");

  const visibleOrders = orders.filter((order) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || [order.order_number, order.customer_name, order.guest_email, order.tracking_number].some((value) => value?.toLowerCase().includes(query));
    return matchesSearch && (statusFilter === "Todos" || order.order_status === statusFilter);
  });

  const exportOrders = () => {
    const rows = [["Pedido", "Cliente", "Email", "Teléfono", "Total", "Estado", "Pago", "Fecha", "Paquetería", "Guía"], ...visibleOrders.map((order) => [order.order_number, order.customer_name ?? "", order.guest_email ?? "", order.phone ?? "", String(order.total), order.order_status ?? "", order.payment_status ?? "", order.created_at, order.shipping_carrier ?? "", order.tracking_number ?? ""])];
    const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll("\"", "\"\"")}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "pedidos-timeshop.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const loadDetail = async (orderId: string) => {
    setLoadingDetail(true);
    setDetailError("");
    try {
      const response = await fetch(`/api/admin?resource=order&id=${encodeURIComponent(orderId)}`);
      const data = await response.json() as { item?: NonNullable<typeof detail>; error?: string };
      if (!response.ok || !data.item) throw new Error(data.error ?? "No se pudo cargar el detalle del pedido.");
      setDetail(data.item);
      setRefundAmount("");
      setRefundReason("");
    } catch (loadError) {
      setDetailError(loadError instanceof Error ? loadError.message : "No se pudo cargar el detalle del pedido.");
    } finally {
      setLoadingDetail(false);
    }
  };

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

  const refundFromDetail = async () => {
    if (!detail) return;
    const amount = Number(refundAmount);
    if (!Number.isFinite(amount) || amount <= 0) { setRefundError("Indica un importe de reembolso válido."); return; }
    if (!window.confirm(`¿Solicitar reembolso de ${formatPrice(amount)}?`)) return;
    setRefunding(true);
    setRefundError("");
    try {
      const response = await fetch("/api/admin/refunds", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: detail.id, amount, reason: refundReason }) });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "No se pudo procesar el reembolso.");
      await loadDetail(detail.id);
      reload();
    } catch (refundError) {
      setRefundError(refundError instanceof Error ? refundError.message : "No se pudo procesar el reembolso.");
    } finally {
      setRefunding(false);
    }
  };

  return (
    <div>
      <div className="page-hero">
        <h1>Pedidos</h1>
        <p>Revisa pagos, envío, clientes y seguimiento de cada compra.</p>
      </div>

      <div className="admin-panel">
        <div className="form-grid" style={{ marginBottom: 18 }}>
          <label>Buscar pedido, cliente, email o guía<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar" /></label>
          <label>Estado<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>Todos</option><option>Pendiente</option><option>Procesando</option><option>Enviado</option><option>Entregado</option><option>Cancelado</option></select></label>
        </div>
        <button className="small-button" onClick={exportOrders} disabled={!visibleOrders.length}>Exportar CSV</button>
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
              {visibleOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.order_number}</td>
                  <td>{order.customer_name ?? "Cliente"}</td>
                  <td>{order.guest_email ?? "-"}</td>
                  <td>{formatPrice(order.total)}</td>
                  <td>{editingId === order.id ? <select value={fulfillment.status} onChange={(event) => setFulfillment({ ...fulfillment, status: event.target.value })} aria-label="Estado del pedido"><option>Pendiente</option><option>Procesando</option><option>Enviado</option><option>Entregado</option><option>Cancelado</option></select> : <span className="status-pill">{order.order_status ?? "Pendiente"}</span>}</td>
                  <td>{new Date(order.created_at).toLocaleDateString("es-MX")}</td>
                  <td>{editingId === order.id ? <><input value={fulfillment.carrier} onChange={(event) => setFulfillment({ ...fulfillment, carrier: event.target.value })} placeholder="Paquetería" aria-label="Paquetería" /><input value={fulfillment.trackingNumber} onChange={(event) => setFulfillment({ ...fulfillment, trackingNumber: event.target.value })} placeholder="Número de guía" aria-label="Número de guía" /></> : order.tracking_number ? <>{order.shipping_carrier ?? "Paquetería"}<br />{order.tracking_number}</> : "Sin asignar"}</td>
                  <td>{editingId === order.id ? <><button className="small-button" onClick={() => saveFulfillment(order.id)} disabled={savingFulfillment}>{savingFulfillment ? "Guardando" : "Guardar envío"}</button><button className="small-button" onClick={() => setEditingId(null)} disabled={savingFulfillment}>Cancelar</button></> : <><button className="small-button" onClick={() => void loadDetail(order.id)}>Ver detalle</button><button className="small-button" onClick={() => beginFulfillment(order)}>Gestionar envío</button>{order.payment_status === "Pagado" && order.paypal_capture_id ? <button className="small-button" onClick={() => refundOrder(order)}>Reembolsar</button> : null}</>}</td>
                </tr>
              ))}
              {!loading && visibleOrders.length === 0 ? <tr><td colSpan={8}>{orders.length ? "No hay pedidos que coincidan con los filtros." : "No hay pedidos registrados."}</td></tr> : null}
            </tbody>
          </table>
        </div>
        {error ? <p className="error-box">{error}</p> : null}
        {fulfillmentError ? <p className="error-box">{fulfillmentError}</p> : null}
        {detailError ? <p className="error-box">{detailError}</p> : null}
        {loadingDetail ? <p className="muted">Cargando detalle del pedido...</p> : null}
        {detail ? <section className="form-card" style={{ marginTop: 18 }}>
          <div className="meta-row"><h2>{detail.order_number}</h2><button className="small-button" onClick={() => setDetail(null)}>Cerrar</button></div>
          <div className="meta-row"><span>Cliente</span><span>{detail.customer_name ?? "Cliente"}</span></div>
          <div className="meta-row"><span>Contacto</span><span>{detail.guest_email ?? "-"}{detail.phone ? ` · ${detail.phone}` : ""}</span></div>
          <div className="meta-row"><span>Pago</span><span>{detail.payment_status ?? "Pendiente"}</span></div>
          {detail.shipping_address ? <div className="meta-row"><span>Entrega</span><span>{[detail.shipping_address.street, detail.shipping_address.number, detail.shipping_address.neighborhood, detail.shipping_address.city, detail.shipping_address.state, detail.shipping_address.postalCode].filter(Boolean).join(", ")}</span></div> : null}
          <h3 style={{ marginTop: 18 }}>Productos</h3>
          {detail.items.map((item) => <div className="meta-row" key={item.id}><span>{item.product_name ?? "Producto"} × {item.quantity ?? 1}</span><span>{formatPrice(Number(item.price ?? 0) * Number(item.quantity ?? 1))}</span></div>)}
          {detail.returns.length ? <><h3 style={{ marginTop: 18 }}>Devoluciones</h3>{detail.returns.map((item) => <div className="meta-row" key={item.id}><span>{item.reason ?? "Devolución"}: {item.status ?? "Pendiente"}</span><span>{item.restocked_at ? "Inventario repuesto" : ""}</span></div>)}</> : null}
          {detail.refunds.length ? <><h3 style={{ marginTop: 18 }}>Reembolsos</h3>{detail.refunds.map((item) => <div className="meta-row" key={item.id}><span>{item.refund_reason ?? "Reembolso"}: {item.refund_status ?? "Pendiente"}</span><span>{formatPrice(Number(item.refund_amount ?? 0))}</span></div>)}</> : null}
          {detail.payment_status === "Pagado" && detail.paypal_capture_id ? <><h3 style={{ marginTop: 18 }}>Solicitar reembolso</h3><div className="form-grid"><label>Importe<input type="number" min="0.01" max={detail.total} step="0.01" value={refundAmount} onChange={(event) => setRefundAmount(event.target.value)} placeholder={`Máximo ${formatPrice(detail.total)}`} /></label><label>Motivo<input value={refundReason} onChange={(event) => setRefundReason(event.target.value)} placeholder="Motivo del reembolso" /></label></div><button className="small-button" onClick={() => void refundFromDetail()} disabled={refunding}>{refunding ? "Procesando" : "Solicitar reembolso"}</button>{refundError ? <p className="error-box">{refundError}</p> : null}</> : null}
        </section> : null}
      </div>
    </div>
  );
}
