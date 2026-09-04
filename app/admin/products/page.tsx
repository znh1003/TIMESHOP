"use client";

import { formatPrice } from "@/lib/admin-data";
import { useAdminResource } from "@/components/admin-data-loader";
import { categories } from "@/data/products";
import { useRef, useState, type ChangeEvent, type DragEvent } from "react";

export const dynamic = "force-dynamic";

type AdminProduct = { id: string; name: string; category: string | null; price: number; stock: string | null; inventory_quantity: number | null; featured: boolean; is_published: boolean; image_url: string | null; gallery: string[] | null };

export default function AdminProductsPage() {
  const { items: products, loading, error, setItems } = useAdminResource<AdminProduct>("products");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ name: "", category: "", price: "", inventoryQuantity: "", gallery: [] as string[] });
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
    setCreating(false);
    setEditingId(product.id);
    setSaveError("");
    setDraft({ name: product.name, category: product.category ?? "", price: String(product.price), inventoryQuantity: String(product.inventory_quantity ?? 0), gallery: product.gallery?.length ? product.gallery : product.image_url ? [product.image_url] : [] });
  };

  const beginCreating = () => {
    setCreating(true);
    setEditingId(null);
    setSaveError("");
    setDraft({ name: "", category: "", price: "", inventoryQuantity: "0", gallery: [] });
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

  const saveProduct = async (id?: string) => {
    setSaving(true);
    setSaveError("");
    try {
      const response = await fetch("/api/admin", { method: id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, name: draft.name, category: draft.category, price: Number(draft.price), inventoryQuantity: Number(draft.inventoryQuantity), gallery: draft.gallery }) });
      const data = await response.json() as { item?: AdminProduct; error?: string };
      if (!response.ok || !data.item) throw new Error(data.error ?? "No se pudo guardar el producto.");
      const savedProduct = data.item;
      setItems((current) => id ? current.map((product) => product.id === id ? { ...product, ...savedProduct } : product) : [savedProduct, ...current]);
      setEditingId(null);
      setCreating(false);
    } catch (saveProductError) {
      setSaveError(saveProductError instanceof Error ? saveProductError.message : "No se pudo guardar el producto.");
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = async (product: AdminProduct) => {
    const response = await fetch("/api/admin", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: product.id, isPublished: !product.is_published }) });
    const data = await response.json() as { item?: AdminProduct; error?: string };
    if (!response.ok || !data.item) return setSaveError(data.error ?? "No se pudo actualizar la publicación.");
    setItems((current) => current.map((item) => item.id === product.id ? { ...item, ...data.item } : item));
  };

  const deleteProduct = async (product: AdminProduct) => {
    if (!window.confirm(`¿Eliminar ${product.name}? Esta acción no se puede deshacer.`)) return;
    const response = await fetch(`/api/admin?id=${encodeURIComponent(product.id)}`, { method: "DELETE" });
    const data = await response.json() as { error?: string };
    if (!response.ok) return setSaveError(data.error ?? "No se pudo eliminar el producto.");
    setItems((current) => current.filter((item) => item.id !== product.id));
  };

  return (
    <div>
      <div className="page-hero">
        <h1>Productos</h1>
        <p>Gestiona catálogo premium, inventario y piezas destacadas.</p>
        <button className="primary-button" type="button" onClick={beginCreating} disabled={creating || editingId !== null}>Nuevo producto</button>
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
              {creating ? <tr>
                <td><input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} aria-label="Nombre del producto" /></td>
                <td>Crea el producto para subir imágenes.</td>
                <td><select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} aria-label="Categoría del producto"><option value="">Selecciona</option>{categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}</select></td>
                <td><input type="number" min="0.01" step="0.01" value={draft.price} onChange={(event) => setDraft({ ...draft, price: event.target.value })} aria-label="Precio del producto" /></td>
                <td>Pendiente de calcular</td>
                <td><input type="number" min="0" step="1" value={draft.inventoryQuantity} onChange={(event) => setDraft({ ...draft, inventoryQuantity: event.target.value })} aria-label="Unidades disponibles" /></td>
                <td><span className="status-pill">Borrador</span></td><td>-</td>
                <td><button className="small-button" onClick={() => saveProduct()} disabled={saving}>{saving ? "Guardando" : "Crear"}</button><button className="small-button" onClick={() => setCreating(false)} disabled={saving}>Cancelar</button></td>
              </tr> : null}
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
                  <td>{product.inventory_quantity === 0 ? "Agotado" : (product.inventory_quantity ?? 0) <= 5 ? "Pocas unidades" : "En stock"}</td>
                  <td>{editingId === product.id ? <input type="number" min="0" step="1" value={draft.inventoryQuantity} onChange={(event) => setDraft({ ...draft, inventoryQuantity: event.target.value })} aria-label="Unidades disponibles" /> : product.inventory_quantity ?? 0}</td>
                  <td><span className="status-pill">{product.is_published ? "Publicado" : "Borrador"}</span></td>
                  <td>
                    <button className="small-button" onClick={() => toggleFeatured(product.id, product.featured)}>
                      {product.featured ? "Quitar" : "Marcar"}
                    </button>
                  </td>
                  <td>{editingId === product.id ? <><button className="small-button" onClick={() => saveProduct(product.id)} disabled={saving}>{saving ? "Guardando" : "Guardar"}</button><button className="small-button" onClick={() => setEditingId(null)} disabled={saving}>Cancelar</button></> : <><button className="small-button" onClick={() => beginEditing(product)} disabled={creating}>Editar</button><button className="small-button" onClick={() => togglePublished(product)} disabled={creating}>{product.is_published ? "Despublicar" : "Publicar"}</button><button className="small-button" onClick={() => deleteProduct(product)} disabled={creating}>Eliminar</button></>}</td>
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
