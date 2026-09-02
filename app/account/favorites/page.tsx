import { FavoriteProducts } from "@/components/favorite-products";

export const dynamic = "force-dynamic";

export default function FavoritesPage() {
  return (
    <div className="container-shell" style={{ padding: "24px 0 40px" }}>
      <div className="page-hero">
        <h1>Mis favoritos</h1>
        <p>Productos guardados para tus próximas compras.</p>
      </div>

      <FavoriteProducts />
    </div>
  );
}
