export const dynamic = "force-dynamic";

export default function FavoritesPage() {
  return (
    <div className="container-shell" style={{ padding: "24px 0 40px" }}>
      <div className="page-hero">
        <h1>Mis favoritos</h1>
        <p>Productos guardados para tus próximas compras.</p>
      </div>

      <div className="product-grid">
        <div className="product-card">
          <img src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80" alt="Favorito 1" />
          <div className="product-body">
            <h3>Designer Table Lamp</h3>
            <div className="price">$1,999 MXN</div>
          </div>
        </div>
      </div>
    </div>
  );
}
