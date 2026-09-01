"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const ADMIN_EMAIL = "admin@timeshop.mx";
const ADMIN_PASSWORD = "admin123";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState(ADMIN_PASSWORD);
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      window.localStorage.setItem("timeshop_admin_session", "active");
      router.push("/admin");
      router.refresh();
      return;
    }

    setError("Credenciales incorrectas. Usa admin@timeshop.mx / admin123");
  };

  return (
    <div className="container-shell" style={{ padding: "56px 0 80px" }}>
      <div className="form-shell" style={{ maxWidth: 480, margin: "0 auto" }}>
        <form className="form-card" onSubmit={handleSubmit}>
          <h1 style={{ marginTop: 0 }}>Acceso administrativo</h1>
          <p className="muted" style={{ marginTop: 0 }}>Inicia sesión para gestionar productos, pedidos y reembolsos.</p>

          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@timeshop.mx"
            />
          </div>

          <div className="field">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error ? <div className="error-box">{error}</div> : null}

          <button className="primary-button" type="submit" style={{ width: "100%" }}>
            Entrar al panel
          </button>
        </form>
      </div>
    </div>
  );
}
