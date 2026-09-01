export default function AboutPage() {
  return (
    <div className="container-shell" style={{ padding: "24px 0 40px" }}>
      <div className="page-hero">
        <h1>Nuestra filosofía</h1>
        <p>No vendemos simplemente productos. Seleccionamos objetos diseñados para formar parte de tu vida.</p>
      </div>

      <div className="story-grid">
        <div className="story-card">
          <h3>Design</h3>
          <p>Objetos con identidad, detalle y proporción cuidadosamente pensada.</p>
        </div>
        <div className="story-card">
          <h3>Quality</h3>
          <p>Materiales durables, acabados refinados y una experiencia premium.</p>
        </div>
        <div className="story-card">
          <h3>Lifestyle</h3>
          <p>Productos para la rutina diaria, el hogar y los momentos más especiales.</p>
        </div>
        <div className="story-card">
          <h3>Exclusivity</h3>
          <p>Ediciones pensadas para quienes valoran la singularidad y la creatividad.</p>
        </div>
      </div>
    </div>
  );
}
