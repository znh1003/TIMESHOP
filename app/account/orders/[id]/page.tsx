"use client";

import { use, useEffect, useState } from "react";
import { formatPrice } from "@/data/products";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<{ order_number: string; total: number; currency: string; order_status: string | null; payment_status: string | null; tracking_number: string | null; shipping_carrier: string | null; shipped_at: string | null; created_at: string } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { fetch(`/api/account?resource=order&orderNumber=${encodeURIComponent(id)}`).then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error); setOrder(data.item); }).catch((requestError: Error) => setError(requestError.message)); }, [id]);

  if (error) return <div className="container-shell" style={{ padding: "24px 0 40px" }}><p className="error-box">{error}</p></div>;
  if (!order) return <div className="container-shell" style={{ padding: "24px 0 40px" }}><p className="muted">Cargando pedido...</p></div>;
  return (
    <div className="container-shell" style={{ padding: "24px 0 40px" }}>
      <div className="page-hero">
        <h1>{order.order_number}</h1>
        <p>{order.order_status ?? "Pendiente"}</p>
      </div>

      <div className="form-card" style={{ maxWidth: 700 }}>
        <div className="meta-row"><span>Pago</span><span>{order.payment_status ?? "Pendiente"}</span></div>
        <div className="meta-row"><span>Total</span><span>{formatPrice(Number(order.total))}</span></div>
        <div className="meta-row"><span>Fecha</span><span>{new Date(order.created_at).toLocaleDateString("es-MX")}</span></div>
        <div className="meta-row"><span>Paquetería</span><span>{order.shipping_carrier ?? "Se asignará al enviar el pedido"}</span></div>
        <div className="meta-row"><span>Guía</span><span>{order.tracking_number ?? "Se asignará al enviar el pedido"}</span></div>
        {order.shipped_at ? <div className="meta-row"><span>Enviado</span><span>{new Date(order.shipped_at).toLocaleDateString("es-MX")}</span></div> : null}
      </div>
    </div>
  );
}
