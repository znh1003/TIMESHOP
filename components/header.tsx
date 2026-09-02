"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { formatPrice, products } from "@/data/products";
import { useEffect, useState } from "react";

const desktopNav = [
  { href: "/shop", label: "Shop" },
  { href: "/shop", label: "Collections" },
  { href: "/shop", label: "New Arrivals" },
  { href: "/about", label: "About" },
];

const mobileSections = [
  {
    title: "SHOP",
    links: [
      { href: "/shop", label: "All Products" },
      { href: "/shop", label: "Collections" },
      { href: "/shop", label: "New Arrivals" },
      { href: "/shop", label: "Best Sellers" },
    ],
  },
  {
    title: "ABOUT",
    links: [
      { href: "/about", label: "Our Story" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "HELP",
    links: [
      { href: "/shipping", label: "Shipping" },
      { href: "/returns", label: "Returns" },
      { href: "/returns-policy", label: "FAQ" },
    ],
  },
];

export function Header() {
  const { items, itemCount, subtotal, updateQuantity, removeFromCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [addedProduct, setAddedProduct] = useState<string | null>(null);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const searchResults = products.filter((product) => `${product.name} ${product.category} ${product.shortDescription}`.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 6);
  const freeShippingThreshold = 2500;
  const drawerShipping = subtotal >= freeShippingThreshold ? 0 : subtotal > 0 ? 299 : 0;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen || cartOpen || searchOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, cartOpen, searchOpen]);

  useEffect(() => {
    const handleAdded = (event: Event) => {
      const product = (event as CustomEvent<{ name: string }>).detail;
      setAddedProduct(product.name);
      setCartOpen(true);
      window.setTimeout(() => setAddedProduct(null), 2800);
    };
    window.addEventListener("timeshop:add-to-cart", handleAdded);
    return () => window.removeEventListener("timeshop:add-to-cart", handleAdded);
  }, []);

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="announcement-bar" aria-label="Store announcement">
        <div className="announcement-track">
          <span>ENVÍO A TODO MÉXICO</span>
          <span>·</span>
          <span>PAGO SEGURO</span>
          <span>·</span>
          <span>DEVOLUCIONES FÁCILES</span>
          <span>·</span>
          <span>ENVÍO A TODO MÉXICO</span>
          <span>·</span>
          <span>PAGO SEGURO</span>
          <span>·</span>
          <span>DEVOLUCIONES FÁCILES</span>
        </div>
      </div>

      <div className="container-shell">
        <div className="site-header-inner">
          <button
            type="button"
            className="mobile-menu-button"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            ☰
          </button>

          <Link href="/" className="brand" aria-label="TIMESHOP home">
            <span className="brand-mark">T</span>
            <span>TIMESHOP</span>
          </Link>

          <nav className="desktop-nav" aria-label="Main navigation">
            {desktopNav.map((item) => (
              <Link key={item.label} href={item.href} className="desktop-nav-link">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="header-actions">
            <button type="button" className="header-link search-link" aria-label="Search" onClick={() => setSearchOpen(true)}>
              Search
            </button>
            <Link href="/login" className="header-link" aria-label="Account">
              Account
            </Link>
            <Link href="/account/favorites" className="header-link" aria-label="Wishlist">
              Wishlist
            </Link>
            <button type="button" className="header-link cart-link" aria-label="Bag" onClick={() => setCartOpen(true)}>
              Bag
              {itemCount > 0 ? <span className="cart-badge">{itemCount}</span> : null}
            </button>
          </div>

          <div className="mobile-header-actions">
            <Link className="mobile-wishlist-link" href="/account/favorites" aria-label="Wishlist">♡</Link>
            <button type="button" className="mobile-bag-button" onClick={() => setCartOpen(true)} aria-label={`Bag${itemCount > 0 ? `, ${itemCount} items` : ""}`}>
              <span>Bag</span>{itemCount > 0 ? <span className="cart-badge">{itemCount}</span> : null}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`mobile-menu-backdrop ${mobileOpen ? "is-open" : ""}`}
        onClick={() => setMobileOpen(false)}
      />

      <aside className={`mobile-drawer ${mobileOpen ? "is-open" : ""}`} aria-label="Mobile menu">
        <div className="mobile-drawer-header">
          <span>Menu</span>
          <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            ×
          </button>
        </div>

        {mobileSections.map((group) => (
          <div key={group.title} className="mobile-group">
            <h3>{group.title}</h3>
            <div className="mobile-links">
              {group.links.map((link) => (
                <Link key={link.label} href={link.href} onClick={() => setMobileOpen(false)}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </aside>

      <div className={`cart-drawer-backdrop ${cartOpen ? "is-open" : ""}`} onClick={() => setCartOpen(false)} />
      <aside className={`cart-drawer ${cartOpen ? "is-open" : ""}`} aria-label="Shopping bag">
        {addedProduct ? <div className="added-confirmation">Added to your bag <span>✓</span><small>{addedProduct}</small></div> : null}
        <div className="cart-drawer-header">
          <div><span className="eyebrow subdued">Your selection</span><h2>Bag ({itemCount})</h2></div>
          <button type="button" onClick={() => setCartOpen(false)} aria-label="Close bag">×</button>
        </div>
        {items.length === 0 ? (
          <div className="cart-drawer-empty"><p>Your bag is currently empty.</p><Link href="/shop" className="primary-button" onClick={() => setCartOpen(false)}>Explore collection</Link></div>
        ) : (
          <>
            <div className="cart-drawer-items">
              {items.map((item) => (
                <div key={item.id} className="cart-drawer-item">
                  <img src={item.image} alt={item.name} />
                  <div><strong>{item.name}</strong><span>{formatPrice(item.price)}</span><div className="drawer-quantity"><button type="button" onClick={() => updateQuantity(item.id, -1)} aria-label="Decrease quantity">−</button><span>{item.quantity}</span><button type="button" onClick={() => updateQuantity(item.id, 1)} aria-label="Increase quantity">+</button><button type="button" onClick={() => removeFromCart(item.id)} aria-label={`Remove ${item.name}`}>Remove</button></div></div>
                </div>
              ))}
            </div>
            <div className="cart-drawer-summary"><div><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div><div className="drawer-shipping-progress"><span>{subtotal >= freeShippingThreshold ? "You unlocked FREE SHIPPING" : `Spend ${formatPrice(freeShippingThreshold - subtotal)} more for free shipping`}</span><i><b style={{ width: `${Math.min(100, subtotal / freeShippingThreshold * 100)}%` }} /></i></div><div className="drawer-coupon"><input value={coupon} onChange={(event) => setCoupon(event.target.value)} placeholder="Promo code" /><button type="button" onClick={() => setDiscount(coupon.trim().toUpperCase() === "TIMESHOP10" ? Math.round(subtotal * 0.1) : 0)}>Apply</button></div>{discount > 0 ? <div><span>Discount</span><strong>-{formatPrice(discount)}</strong></div> : null}<div><span>Shipping</span><strong>{drawerShipping ? formatPrice(drawerShipping) : "FREE"}</strong></div><div><span>Total</span><strong>{formatPrice(subtotal + drawerShipping - discount)}</strong></div><Link href="/checkout" className="primary-button" onClick={() => setCartOpen(false)}>Checkout</Link><Link href="/shop" className="ghost-button" onClick={() => setCartOpen(false)}>Continue shopping</Link></div>
          </>
        )}
      </aside>

      <div className={`search-overlay ${searchOpen ? "is-open" : ""}`} role="dialog" aria-modal="true" aria-label="Search products">
        <div className="search-overlay-inner">
          <div className="search-overlay-top"><span>Search</span><button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search">×</button></div>
          <input autoFocus={searchOpen} value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search products..." />
          <div className="search-results">
            {!searchTerm ? <p>Search products by name or category.</p> : searchResults.length === 0 ? <p>No products found.</p> : searchResults.map((product) => <Link key={product.id} href={`/products/${product.slug}`} onClick={() => setSearchOpen(false)}><img src={product.image} alt="" /><span><strong>{product.name}</strong><small>{formatPrice(product.price)}</small></span></Link>)}
          </div>
        </div>
      </div>
    </header>
  );
}
