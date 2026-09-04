"use client";

import { formatPrice } from "@/lib/admin-data";
import { useAdminResource } from "@/components/admin-data-loader";
import { categories } from "@/data/products";
import { useRef, useState, type ChangeEvent, type DragEvent } from "react";

export const dynamic = "force-dynamic";

type AdminProduct = { id: string; name: string; category: string | null; price: number; stock: string | null; inventory_quantity: number | null; featured: boolean; image_url: string | null; gallery: string[] | null };

export default function AdminProductsPage() {
  const { items: products, loading, error, setItems } = useAdminResource<AdminProduct>("products");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ name: "", category: "", price: "", stock: "", inventoryQuantity: "", gallery: [] as string[] });
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [draggedImage, setDraggedImage] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleFeatured = async (id: string, featured: boolean) => {
    const response = await fetch("/api/admin", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, featured: !featured }) });
    if (response.ok) setItems((current) => current.map((product) => product.id === id ? { ...product, featured: !featured } : product));
  };

  const beginEditing = (product: AdminProduct) => {
    setEditingId(product.id);
    setSaveError("");
    setDraft({ name: product.name, category: product.category ?? "", price: String(product.price), stock: product.stock ?? "", inventoryQuantity: String(product.inventory_quantity ?? 0), gallery: product.gallery?.length ? product.gallery : product.image_url ? [product.image_url] : [] });
  };

  const uploadImages = async (files: FileList | File[]) => {
    if (!editingId) return;
    const selectedFiles = Array.from(files).slice(0, 8 - draft.gallery.length);
    if (!selectedFiles.length) return;
    if (selectedFiles.some((file) => !file.type.startsWith("image/") || file.size > 8 * 1024 * 1024)) {
      setSaveError("Selecciona imágenes de hasta 8 MB cada una.");
      return;
    }
    setUploading(true);
    setSaveError("");
    try {
      const formData = new FormData();
      formData.append("productId", editingId);
      selectedFiles.forEach((file) => formData.append("images", file));
      const response = await fetch("/api/admin/products/images", { method: "POST", body: formData });
      const data = await response.json() as { urls?: string[]; error?: string };
      const uploadedUrls = data.urls;
      if (!response.ok || !uploadedUrls) throw new Error(data.error ?? "No se pudieron subir las imágenes.");
      setDraft((current) => ({ ...current, gallery: [...current.gallery, ...uploadedUrls] }));
    } catch (uploadError) {
      setSaveError(uploadError instanceof Error ? uploadError.message : "No se pudieron subir las imágenes.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) void uploadImages(event.target.files);
    event.target.value = "";
  };

  const reorderImage = (targetIndex: number) => {
    if (draggedImage === null || draggedImage === targetIndex) return;
    setDraft((current) => {
      const gallery = [...current.gallery];
      const [image] = gallery.splice(draggedImage, 1);
      gallery.splice(targetIndex, 0, image);
      return { ...current, gallery };
    });
    setDraggedImage(null);
  };

  const saveProduct = async (id: string) => {
    setSaving(true);
    setSaveError("");
    try {
      const response = await fetch("/api/admin", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, name: draft.name, category: draft.category, price: Number(draft.price), stock: draft.stock, inventoryQuantity: Number(draft.inventoryQuantity), gallery: draft.gallery }) });
      const data = await response.json() as { item?: AdminProduct; error?: string };
      if (!response.ok || !data.item) throw new Error(data.error ?? "No se pudo guardar el producto.");
      setItems((current) => current.map((product) => product.id === id ? { ...product, ...data.item } : product));
      setEditingId(null);
    } catch (saveProductError) {
      setSaveError(saveProductError instanceof Error ? saveProductError.message : "No se pudo guardar el producto.");
    } finally {
      setSaving(false);
    }
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
                <th>Imágenes</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Unidades</th>
                <th>Estado</th>
                <th>Featured</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{editingId === product.id ? <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} aria-label="Nombre del producto" /> : product.name}</td>
                  <td>
                    {editingId === product.id ? <div className="product-image-editor" onDragOver={(event: DragEvent<HTMLDivElement>) => event.preventDefault()} onDrop={(event: DragEvent<HTMLDivElement>) => { event.preventDefault(); void uploadImages(event.dataTransfer.files); }}>
                      <div className="product-image-strip" aria-label="Imágenes del producto">
                        {draft.gallery.map((image, index) => <div className="product-image-thumb" key={image} draggable onDragStart={() => setDraggedImage(index)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); reorderImage(index); }}>
                          <img src={image} alt={`Imagen ${index + 1} de ${draft.name}`} />
                          <button type="button" className="product-image-remove" onClick={() => setDraft((current) => ({ ...current, gallery: current.gallery.filter((_, imageIndex) => imageIndex !== index) }))} aria-label={`Eliminar imagen ${index + 1}`}>×</button>
                        </div>)}
                        {draft.gallery.length < 8 ? <button type="button" className="product-image-dropzone" onClick={() => fileInputRef.current?.click()} disabled={uploading}>{uploading ? "Subiendo..." : "Arrastra o sube"}</button> : null}
                      </div>
                      <input ref={fileInputRef} className="visually-hidden" type="file" accept="image/*" multiple onChange={handleFileChange} />
                    </div> : product.image_url ? <img className="admin-product-thumb" src={product.image_url} alt="" /> : "Sin imagen"}
                  </td>
                  <td>{editingId === product.id ? <select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} aria-label="Categoría del producto"><option value="">Selecciona</option>{categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}</select> : product.category}</td>
                  <td>{editingId === product.id ? <input type="number" min="0.01" step="0.01" value={draft.price} onChange={(event) => setDraft({ ...draft, price: event.target.value })} aria-label="Precio del producto" /> : formatPrice(product.price)}</td>
                  <td>{editingId === product.id ? <input value={draft.stock} onChange={(event) => setDraft({ ...draft, stock: event.target.value })} aria-label="Inventario del producto" /> : product.stock}</td>
                  <td>{editingId === product.id ? <input type="number" min="0" step="1" value={draft.inventoryQuantity} onChange={(event) => setDraft({ ...draft, inventoryQuantity: event.target.value })} aria-label="Unidades disponibles" /> : product.inventory_quantity ?? 0}</td>
                  <td><span className="status-pill">Publicado</span></td>
                  <td>
                    <button className="small-button" onClick={() => toggleFeatured(product.id, product.featured)}>
                      {product.featured ? "Quitar" : "Marcar"}
                    </button>
                  </td>
                  <td>{editingId === product.id ? <><button className="small-button" onClick={() => saveProduct(product.id)} disabled={saving}>{saving ? "Guardando" : "Guardar"}</button><button className="small-button" onClick={() => setEditingId(null)} disabled={saving}>Cancelar</button></> : <button className="small-button" onClick={() => beginEditing(product)}>Editar</button>}</td>
                </tr>
              ))}
              {!loading && products.length === 0 ? <tr><td colSpan={9}>No hay productos registrados.</td></tr> : null}
            </tbody>
          </table>
        </div>
        {error ? <p className="error-box">{error}</p> : null}
        {saveError ? <p className="error-box">{saveError}</p> : null}
      </div>
    </div>
  );
}
