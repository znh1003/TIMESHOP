import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container-shell footer-grid">
        <div>
          <div className="brand" style={{ marginBottom: 12 }}>
            <span className="brand-mark">T</span>
            <span>TIMESHOP</span>
          </div>
          <p className="muted" style={{ maxWidth: 280 }}>
            Objetos singulares para vivir mejor, con intención y estilo.
          </p>
        </div>

        <div>
          <h3 className="footer-title">Compra segura</h3>
          <div className="footer-links">
            <Link href="/about">Nuestra filosofía</Link>
            <Link href="/shipping">Envíos</Link>
            <Link href="/returns-policy">Devoluciones</Link>
            <Link href="/privacy">Política de privacidad</Link>
          </div>
        </div>

        <div>
          <h3 className="footer-title">Ayuda</h3>
          <div className="footer-links">
            <Link href="/contact">Contacto</Link>
            <Link href="/returns">Solicitar devolución</Link>
            <Link href="/terms">Términos y condiciones</Link>
            <Link href="/cookies">Política de cookies</Link>
          </div>
        </div>

        <div>
          <h3 className="footer-title">Protección</h3>
          <div className="footer-links">
            <span>Protección de compra</span>
            <span>Pago seguro con PayPal</span>
            <span>Atención personalizada</span>
            <span>Soporte por WhatsApp</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
