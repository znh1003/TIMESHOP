"use client";

import { useAdminResource } from "@/components/admin-data-loader";

export const dynamic = "force-dynamic";

type AuditEntry = {
  id: string;
  admin_email: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: Record<string, unknown> | null;
  created_at: string;
};

export default function AdminAuditPage() {
  const { items, loading, error } = useAdminResource<AuditEntry>("audit");

  return (
    <div>
      <div className="page-hero">
        <h1>Actividad administrativa</h1>
        <p>Historial de cambios realizados desde el panel.</p>
      </div>
      <div className="admin-panel">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Fecha</th><th>Administrador</th><th>Acción</th><th>Objeto</th><th>Detalle</th></tr></thead>
            <tbody>
              {items.map((entry) => <tr key={entry.id}>
                <td>{new Date(entry.created_at).toLocaleString("es-MX")}</td>
                <td>{entry.admin_email}</td>
                <td>{entry.action}</td>
                <td>{entry.resource_type} · {entry.resource_id.slice(0, 8)}</td>
                <td>{entry.details && Object.keys(entry.details).length ? Object.entries(entry.details).map(([key, value]) => `${key}: ${String(value)}`).join(" · ") : "-"}</td>
              </tr>)}
              {!loading && items.length === 0 ? <tr><td colSpan={5}>Aún no hay acciones registradas.</td></tr> : null}
            </tbody>
          </table>
        </div>
        {error ? <p className="error-box">{error}</p> : null}
      </div>
    </div>
  );
}