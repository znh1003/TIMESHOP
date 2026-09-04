"use client";

import { useAdminResource } from "@/components/admin-data-loader";
import { useState } from "react";

type ContactMessage = { id: string; name: string; email: string; message: string; status: string; created_at: string; resolved_at: string | null };

export const dynamic = "force-dynamic";

export default function AdminMessagesPage() {
  const { items, loading, error, setItems } = useAdminResource<ContactMessage>("messages");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    const response = await fetch("/api/admin", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resource: "messages", id, status }) });
    const data = await response.json() as { item?: Pick<ContactMessage, "id" | "status" | "resolved_at"> };
    if (response.ok && data.item) setItems((current) => current.map((item) => item.id === id ? { ...item, ...data.item } : item));
    setUpdatingId(null);
  };

  return <div>
    <div className="page-hero"><h1>Mensajes</h1><p>Consultas enviadas desde el formulario de contacto.</p></div>
    <div className="admin-panel"><div className="table-wrap"><table>
      <thead><tr><th>Fecha</th><th>Cliente</th><th>Mensaje</th><th>Estado</th></tr></thead>
      <tbody>{items.map((item) => <tr key={item.id}>
        <td>{new Date(item.created_at).toLocaleString("es-MX")}</td>
        <td>{item.name}<br />{item.email}</td>
        <td>{item.message}</td>
        <td><select value={item.status} onChange={(event) => void updateStatus(item.id, event.target.value)} disabled={updatingId === item.id} aria-label={`Estado del mensaje de ${item.name}`}><option>Nuevo</option><option>En proceso</option><option>Resuelto</option></select></td>
      </tr>)}{!loading && items.length === 0 ? <tr><td colSpan={4}>No hay mensajes todavía.</td></tr> : null}</tbody>
    </table></div>{error ? <p className="error-box">{error}</p> : null}</div>
  </div>;
}