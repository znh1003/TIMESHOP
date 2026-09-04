"use client";

import { formatPrice } from "@/lib/admin-data";
import { useAdminResource } from "@/components/admin-data-loader";
import { useState } from "react";

export const dynamic = "force-dynamic";

export default function AdminCustomersPage() {
  const { items: customers, loading, error } = useAdminResource<{ email: string; name: string; city: string; orders: number; totalSpent: number }>("customers");
  const [search, setSearch] = useState("");
  const visibleCustomers = customers.filter((customer) => [customer.name, customer.email, customer.city].some((value) => value.toLowerCase().includes(search.trim().toLowerCase())));

  const exportCustomers = () => {
    const rows = [["Nombre", "Email", "Ciudad", "Pedidos", "Gasto total"], ...visibleCustomers.map((customer) => [customer.name, customer.email, customer.city, String(customer.orders), String(customer.totalSpent)])];
    const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll("\"", "\"\"")}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "clientes-timeshop.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="page-hero">
        <h1>Clientes</h1>
        <p>Historial de clientes, compras y ubicación para ventas personalizadas.</p>
      </div>

      <div className="admin-panel">
        <div className="form-grid" style={{ marginBottom: 18 }}><label>Buscar cliente<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nombre, email o ciudad" /></label></div>
        <button className="small-button" onClick={exportCustomers} disabled={!visibleCustomers.length}>Exportar CSV</button>
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
              {visibleCustomers.map((customer) => (
                <tr key={customer.email}>
                  <td>{customer.name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.city}</td>
                  <td>{customer.orders}</td>
                  <td>{formatPrice(customer.totalSpent)}</td>
                </tr>
              ))}
              {!loading && visibleCustomers.length === 0 ? <tr><td colSpan={5}>{customers.length ? "No hay clientes que coincidan con la búsqueda." : "No hay clientes con pedidos registrados."}</td></tr> : null}
            </tbody>
          </table>
        </div>
        {error ? <p className="error-box">{error}</p> : null}
      </div>
    </div>
  );
}
