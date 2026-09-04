import { NextResponse } from "next/server";
import { createAdminAuthClient, createAdminDataClient, isAdminEmail } from "@/lib/admin-auth";

function requestCookies(request: Request) {
  return () => request.headers.get("cookie")?.split(";").map((part) => {
    const [name, ...value] = part.trim().split("=");
    return { name, value: value.join("=") };
  }).filter((cookie) => cookie.name) ?? [];
}

async function authorizedClient(request: Request) {
  const auth = createAdminAuthClient(requestCookies(request));
  const { data } = auth ? await auth.auth.getUser() : { data: { user: null } };
  if (!isAdminEmail(data.user?.email)) return null;
  return createAdminDataClient();
}

export async function GET(request: Request) {
  const supabase = await authorizedClient(request);
  if (!supabase) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const resource = new URL(request.url).searchParams.get("resource");
  if (resource === "dashboard") {
    const [orders, products, refunds] = await Promise.all([
      supabase.from("orders").select("order_number, customer_name, guest_email, total, order_status").order("created_at", { ascending: false }).limit(100),
      supabase.from("products").select("id, name, stock, inventory_quantity, price, featured").order("created_at", { ascending: false }),
      supabase.from("refunds").select("refund_amount"),
    ]);
    if (orders.error || products.error || refunds.error) return NextResponse.json({ error: "No se pudieron cargar los datos del panel." }, { status: 500 });
    return NextResponse.json({ orders: orders.data, products: products.data, refunds: refunds.data, customerCount: new Set((orders.data ?? []).map((order) => order.guest_email).filter(Boolean)).size });
  }

  const queries = {
    products: () => supabase.from("products").select("id, name, category, price, stock, inventory_quantity, featured, image_url, gallery, created_at").order("created_at", { ascending: false }),
    orders: () => supabase.from("orders").select("id, order_number, customer_name, guest_email, phone, shipping_address, total, order_status, payment_status, paypal_capture_id, tracking_number, shipping_carrier, shipped_at, created_at").order("created_at", { ascending: false }),
    returns: () => supabase.from("returns").select("id, order_id, reason, status, created_at, orders(customer_name, guest_email, order_number)").order("created_at", { ascending: false }),
    refunds: () => supabase.from("refunds").select("id, order_id, refund_amount, refund_status, created_at").order("created_at", { ascending: false }),
  } as const;

  if (resource === "customers") {
    const { data, error } = await supabase.from("orders").select("guest_email, customer_name, total, shipping_address").order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: "No se pudieron cargar los clientes." }, { status: 500 });
    const customers = Object.values((data ?? []).reduce<Record<string, { email: string; name: string; city: string; orders: number; totalSpent: number }>>((result, order) => {
      const email = order.guest_email ?? "Sin correo";
      const current = result[email] ?? { email, name: order.customer_name ?? "Cliente", city: (order.shipping_address as { city?: string } | null)?.city ?? "-", orders: 0, totalSpent: 0 };
      current.orders += 1;
      current.totalSpent += Number(order.total ?? 0);
      result[email] = current;
      return result;
    }, {}));
    return NextResponse.json({ items: customers });
  }

  if (!resource || !(resource in queries)) return NextResponse.json({ error: "Recurso no encontrado." }, { status: 404 });
  const { data, error } = await queries[resource as keyof typeof queries]();
  if (error) return NextResponse.json({ error: "No se pudieron cargar los datos." }, { status: 500 });
  return NextResponse.json({ items: data });
}

export async function PATCH(request: Request) {
  const supabase = await authorizedClient(request);
  if (!supabase) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const { id, featured, name, category, price, stock, inventoryQuantity, gallery, resource, status, trackingNumber, shippingCarrier } = await request.json() as { id?: string; featured?: boolean; name?: string; category?: string; price?: number; stock?: string; inventoryQuantity?: number; gallery?: string[]; resource?: string; status?: string; trackingNumber?: string; shippingCarrier?: string };
  if (resource === "returns") {
    const allowedStatuses = ["Solicitud de devolución", "En revisión", "Aprobada", "Rechazada", "Recibida", "Cerrada"];
    if (!id || !status || !allowedStatuses.includes(status)) return NextResponse.json({ error: "Estado de devolución inválido." }, { status: 400 });
    const { data, error } = await supabase.from("returns").update({ status }).eq("id", id).select("id, status").single();
    if (error) return NextResponse.json({ error: "No se pudo actualizar la devolución." }, { status: 500 });
    return NextResponse.json({ item: data });
  }
  if (resource === "orders") {
    const allowedStatuses = ["Pendiente", "Procesando", "Enviado", "Entregado", "Cancelado"];
    if (!id || !status || !allowedStatuses.includes(status)) return NextResponse.json({ error: "Estado de pedido inválido." }, { status: 400 });
    const tracking = trackingNumber?.trim() ?? "";
    const carrier = shippingCarrier?.trim() ?? "";
    if (status === "Enviado" && (!tracking || !carrier)) return NextResponse.json({ error: "Indica paquetería y número de guía antes de enviar." }, { status: 400 });
    const { data, error } = await supabase.from("orders").update({
      order_status: status,
      tracking_number: tracking || null,
      shipping_carrier: carrier || null,
      shipped_at: status === "Enviado" ? new Date().toISOString() : null,
    }).eq("id", id).select("id, order_status, tracking_number, shipping_carrier, shipped_at").single();
    if (error) return NextResponse.json({ error: "No se pudo actualizar el envío." }, { status: 500 });
    return NextResponse.json({ item: data });
  }
  if (!id) return NextResponse.json({ error: "Producto inválido." }, { status: 400 });
  const update: { featured?: boolean; name?: string; category?: string; price?: number; stock?: string; inventory_quantity?: number; image_url?: string; gallery?: string[] } = {};
  if (typeof featured === "boolean") update.featured = featured;
  if (name !== undefined) {
    if (!name.trim()) return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 });
    update.name = name.trim();
  }
  if (category !== undefined) {
    if (!category.trim()) return NextResponse.json({ error: "La categoría es obligatoria." }, { status: 400 });
    update.category = category.trim();
  }
  if (price !== undefined) {
    if (!Number.isFinite(price) || price <= 0) return NextResponse.json({ error: "El precio debe ser mayor a cero." }, { status: 400 });
    update.price = Math.round(price * 100) / 100;
  }
  if (stock !== undefined) {
    if (!stock.trim()) return NextResponse.json({ error: "El inventario es obligatorio." }, { status: 400 });
    update.stock = stock.trim();
  }
  if (inventoryQuantity !== undefined) {
    if (!Number.isInteger(inventoryQuantity) || inventoryQuantity < 0) return NextResponse.json({ error: "El inventario debe ser un número entero igual o mayor a cero." }, { status: 400 });
    update.inventory_quantity = inventoryQuantity;
  }
  if (gallery !== undefined) {
    if (!Array.isArray(gallery) || gallery.length > 8 || gallery.some((image) => typeof image !== "string" || !image.startsWith("https://"))) {
      return NextResponse.json({ error: "Las imágenes del producto no son válidas." }, { status: 400 });
    }
    update.gallery = gallery;
    update.image_url = gallery[0] ?? "";
  }
  if (Object.keys(update).length === 0) return NextResponse.json({ error: "No hay cambios para guardar." }, { status: 400 });
  const { data, error } = await supabase.from("products").update(update).eq("id", id).select("id, name, category, price, stock, inventory_quantity, featured, image_url, gallery").single();
  if (error) return NextResponse.json({ error: "No se pudo actualizar el producto." }, { status: 500 });
  return NextResponse.json({ item: data });
}