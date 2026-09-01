export default function ReturnsPage() {
  return (
    <div className="container-shell" style={{ padding: "24px 0 40px" }}>
      <div className="page-hero">
        <h1>Solicitar devolución</h1>
        <p>Consulta la solicitud de devolución y sigue el proceso.</p>
      </div>

      <div className="form-card" style={{ maxWidth: 680, margin: "0 auto" }}>
        <div className="field">
          <label>Motivo</label>
          <select defaultValue="Producto defectuoso">
            <option>Producto defectuoso</option>
            <option>Producto dañado</option>
            <option>Producto incorrecto</option>
            <option>Ya no lo necesito</option>
            <option>Otro</option>
          </select>
        </div>
        <div className="field">
          <label>Descripción</label>
          <textarea rows={5} defaultValue="El producto llegó con un daño leve en la base." />
        </div>
        <button className="primary-button" style={{ width: "100%" }}>Enviar solicitud</button>
      </div>
    </div>
  );
}
