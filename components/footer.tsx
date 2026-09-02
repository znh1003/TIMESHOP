import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container-shell footer-grid">
        <div>
          <div className="brand footer-brand">
            <span className="brand-mark">T</span>
            <span>TIMESHOP</span>
          </div>
          <p className="muted" style={{ maxWidth: 280 }}>
            Discover better products for a better everyday life.
          </p>
        </div>

        <div>
          <h3 className="footer-title">Shop</h3>
          <div className="footer-links">
            <Link href="/shop">Shop All</Link>
            <Link href="/shop">New Arrivals</Link>
            <Link href="/shop">Best Sellers</Link>
            <Link href="/shop">Collections</Link>
          </div>
        </div>

        <div>
          <h3 className="footer-title">Customer care</h3>
          <div className="footer-links">
            <Link href="/contact">Contact</Link>
            <Link href="/shipping">Shipping</Link>
            <Link href="/returns-policy">Returns</Link>
            <Link href="/returns-policy">FAQ</Link>
          </div>
        </div>

        <div>
          <h3 className="footer-title">About</h3>
          <div className="footer-links">
            <Link href="/about">Our Story</Link>
            <Link href="/about">About TIMESHOP</Link>
          </div>
        </div>

        <div>
          <h3 className="footer-title">Legal</h3>
          <div className="footer-links">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms & Conditions</Link>
            <Link href="/returns-policy">Refund Policy</Link>
            <Link href="/cookies">Cookie Policy</Link>
          </div>
        </div>
      </div>
      <div className="container-shell footer-bottom"><span>© 2026 TIMESHOP. All rights reserved.</span><span>Instagram · Facebook · TikTok</span></div>
      <div className="container-shell footer-newsletter"><strong>Join the TIMESHOP community.</strong><form><input type="email" aria-label="Email" placeholder="Email" required /><button type="submit">Subscribe</button></form></div>
    </footer>
  );
}
