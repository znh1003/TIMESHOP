"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const session = window.localStorage.getItem("timeshop_admin_session");
    const allowed = session === "active";
    setIsAuthenticated(allowed);
    setReady(true);

    if (!allowed && pathname !== "/admin/login") {
      router.replace("/admin/login");
    }
  }, [pathname, router]);

  if (!ready) {
    return <div className="container-shell" style={{ padding: "48px 0" }}>Cargando panel...</div>;
  }

  if (!isAuthenticated && pathname !== "/admin/login") {
    return null;
  }

  return (
    <div className="container-shell" style={{ padding: "24px 0 40px" }}>
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <div className="admin-brand">TIMESHOP Admin</div>
          <nav className="admin-nav">
            <Link href="/admin">Dashboard</Link>
            <Link href="/admin/products">Productos</Link>
            <Link href="/admin/orders">Pedidos</Link>
            <Link href="/admin/customers">Clientes</Link>
            <Link href="/admin/returns">Devoluciones</Link>
            <Link href="/admin/refunds">Refunds</Link>
          </nav>
          <button
            className="ghost-button"
            onClick={() => {
              window.localStorage.removeItem("timeshop_admin_session");
              router.push("/admin/login");
            }}
            style={{ width: "100%", marginTop: "16px" }}
          >
            Cerrar sesión
          </button>
        </aside>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
