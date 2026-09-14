export function WhatsAppButton() {
  const href = "https://wa.me/8617820479265?text=Hola%20TIMESHOP%2C%20quiero%20consultar%20un%20producto.";

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="whatsapp-float"
      aria-label="Contactar por WhatsApp"
    >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4.2A8 8 0 1 1 20 11.5Z" />
          <path d="M8.5 9.2c.5 2.4 2.1 4.1 4.5 4.6M9 8.2l1 1.9-1.1 1.1M14.7 14.7l-1.6-.5" />
        </svg>
    </a>
  );
}
