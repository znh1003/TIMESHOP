"use client";

import { useAdminResource } from "@/components/admin-data-loader";
import { useState } from "react";

export const dynamic = "force-dynamic";

export default function AdminReturnsPage() {
  const { items: returns, loading, error, setItems } = useAdminResource<{ id: string; order_id: string; reason: string | null; status: string | null; inspection_notes: string | null; restock_approved: boolean | null; orders: { customer_name: string | null; guest_email: string | null; order_number: string | null } | null }>("returns");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [inspection, setInspection] = useState<{ id: string; notes: string; restockApproved: boolean } | null>(null);

  const updateStatus = async (id: string, status: string) => {
    if (status === "Recibida") {
      const returnItem = returns.find((item) => item.id === id);
      setInspection({ id, notes: returnItem?.inspection_notes ?? "", restockApproved: returnItem?.restock_approved === true });
      return;
    }
    setUpdatingId(id);
    const response = await fetch("/api/admin", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resource: "returns", id, status }) });
    if (response.ok) setItems((current) => current.map((item) => item.id === id ? { ...item, status } : item));
    setUpdatingId(null);
  };

  const saveInspection = async () => {
    if (!inspection) return;
    setUpdatingId(inspection.id);
    const response = await fetch("/api/admin", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resource: "returns", id: inspection.id, status: "Recibida", inspectionNotes: inspection.notes, restockApproved: inspection.restockApproved }) });
    const data = await response.json() as { item?: { status: string; inspection_notes: string | null; restock_approved: boolean | null }; error?: string };
    if (response.ok && data.item) {
      setItems((current) => current.map((item) => item.id === inspection.id ? { ...item, ...data.item } : item));
      setInspection(null);
    }
    setUpdatingId(null);
  };

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
                <th>Inspección</th>
                <th>Actualizar</th>
              </tr>
            </thead>
            <tbody>
              {returns.map((returnItem) => (
                <tr key={returnItem.id}>
                  <td>{returnItem.id.slice(0, 8)}</td>
                  <td>{returnItem.orders?.customer_name ?? returnItem.orders?.guest_email ?? "-"}</td>
                  <td>{returnItem.reason ?? "-"}</td>
                  <td><span className="status-pill">{returnItem.status ?? "En revisión"}</span></td>
                  <td>{returnItem.orders?.order_number ?? returnItem.order_id.slice(0, 8)}</td>
                  <td>{returnItem.status === "Recibida" ? <>{returnItem.restock_approved ? "Reintegrar inventario" : "No reintegrar"}{returnItem.inspection_notes ? <><br />{returnItem.inspection_notes}</> : null}</> : "-"}</td>
                  <td><select value={returnItem.status ?? "Solicitud de devolución"} onChange={(event) => updateStatus(returnItem.id, event.target.value)} disabled={updatingId === returnItem.id} aria-label="Estado de devolución"><option>Solicitud de devolución</option><option>En revisión</option><option>Aprobada</option><option>Rechazada</option><option>Recibida</option><option>Cerrada</option></select></td>
                </tr>
              ))}
              {!loading && returns.length === 0 ? <tr><td colSpan={7}>No hay devoluciones registradas.</td></tr> : null}
            </tbody>
          </table>
        </div>
        {error ? <p className="error-box">{error}</p> : null}
        {inspection ? <section className="form-card" style={{ marginTop: 18 }}><h2>Recepción y revisión</h2><label>Notas de inspección<textarea value={inspection.notes} onChange={(event) => setInspection({ ...inspection, notes: event.target.value })} placeholder="Estado del artículo, daños o decisión de reventa" /></label><label><input type="checkbox" checked={inspection.restockApproved} onChange={(event) => setInspection({ ...inspection, restockApproved: event.target.checked })} /> Reintegrar artículos aprobados al inventario</label><div><button className="small-button" onClick={() => void saveInspection()} disabled={updatingId === inspection.id}>{updatingId === inspection.id ? "Guardando" : "Confirmar recepción"}</button><button className="small-button" onClick={() => setInspection(null)} disabled={updatingId === inspection.id}>Cancelar</button></div></section> : null}
      </div>
    </div>
  );
}
