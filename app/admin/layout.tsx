"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { startTransition, useEffect, useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/login") return;
    void fetch("/api/admin/session")
      .then(async (response) => response.ok ? response.json() as Promise<{ authenticated: boolean }> : { authenticated: false })
      .then(({ authenticated }) => {
        startTransition(() => {
          setIsAuthenticated(authenticated);
          setReady(true);
        });
        if (!authenticated) router.replace("/admin/login");
      })
      .catch(() => {
        startTransition(() => setReady(true));
        router.replace("/admin/login");
      });
  }, [pathname, router]);

  if (pathname === "/admin/login") {
    return children;
  }

  if (!ready) {
    return <div className="container-shell" style={{ padding: "48px 0" }}>Cargando panel...</div>;
  }

  if (!isAuthenticated) {
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
            <Link href="/admin/audit">Actividad</Link>
          </nav>
          <button
            className="ghost-button"
            onClick={async () => {
              await fetch("/api/admin/logout", { method: "POST" });
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
