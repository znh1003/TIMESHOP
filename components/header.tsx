"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-provider";

const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/shop", label: "Tienda" },
  { href: "/category/hogar", label: "Hogar" },
  { href: "/category/mascotas", label: "Mascotas" },
  { href: "/category/auto", label: "Auto" },
  { href: "/category/outdoor", label: "Outdoor" },
  { href: "/category/regalos", label: "Regalos" },
];

export function Header() {
  const { itemCount } = useCart();

  return (
    <header className="site-header">
      <div className="container-shell">
        <div className="promo-bar">Envío a todo México</div>
        <div className="site-header-inner">
          <Link href="/" className="brand" aria-label="TIMESHOP inicio">
            <span className="brand-mark">T</span>
            <span>TIMESHOP</span>
          </Link>

          <div className="header-actions">
            <Link href="/shop" className="header-link" aria-label="Buscar productos">
              Buscar
            </Link>
            <Link href="/login" className="header-link" aria-label="Cuenta">
              Cuenta
            </Link>
            <Link href="/account/favorites" className="header-link" aria-label="Favoritos">
              Favoritos
            </Link>
            <Link href="/cart" className="header-link" aria-label="Bolsa">
              Bolsa
              {itemCount > 0 ? <span className="cart-badge">{itemCount}</span> : null}
            </Link>
          </div>
        </div>

        <nav className="mobile-nav" aria-label="Navegación principal">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
