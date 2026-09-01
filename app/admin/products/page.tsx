"use client";

import { useEffect, useState } from "react";
import { formatPrice, getAdminState, saveAdminState } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default function AdminProductsPage() {
  const [state, setState] = useState(getAdminState());

  useEffect(() => {
    setState(getAdminState());
  }, []);

  const toggleFeatured = (id: string) => {
    const next = {
      ...state,
      products: state.products.map((product) =>
        product.id === id ? { ...product, featured: !product.featured } : product,
      ),
    };

    setState(next);
    saveAdminState(next);
  };

  return (
    <div>
      <div className="page-hero">
        <h1>Productos</h1>
        <p>Gestiona catálogo premium, inventario y piezas destacadas.</p>
      </div>

      <div className="admin-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Featured</th>
              </tr>
            </thead>
            <tbody>
              {state.products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>{formatPrice(product.price)}</td>
                  <td>{product.stock}</td>
                  <td><span className="status-pill">{product.status}</span></td>
                  <td>
                    <button className="small-button" onClick={() => toggleFeatured(product.id)}>
                      {product.featured ? "Quitar" : "Marcar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
