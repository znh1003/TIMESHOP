export function WhatsAppButton() {
  const href = "https://wa.me/5215512345678?text=Hola%20TIMESHOP%2C%20quiero%20consultar%20un%20producto.";

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="whatsapp-float"
      aria-label="Contactar por WhatsApp"
    >
      WhatsApp
    </a>
  );
}
