"use client";

import { useState } from "react";
import { FaUser } from "react-icons/fa";
import axios from "axios";
import Message from "./Message"; // Importa el componente Message

export default function LoginFormPopUp() {
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://127.0.0.1:5000/api/login", {
        username,
        password,
      });

      if (response.status === 200 && response.data.role === "admin") {
        setMessage({ type: "success", text: "Inicio de sesión exitoso. Redirigiendo..." });
        setIsOpen(false);
        setTimeout(() => {
          window.location.href = "/revision"; // Redirige a la página de revisión
        }, 2000);
      } else {
        setMessage({ type: "error", text: "No tienes permisos para acceder a esta sección." });
      }
    } catch (err) {
      console.error("Error en el inicio de sesión:", err);
      setMessage({ type: "error", text: "Usuario o contraseña incorrectos." });
    }
  };

  return (
    <div className="relative">
      {/* Botón para abrir el popup */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-4 right-4 text-white bg-blue-500 p-2 rounded-full hover:bg-blue-600"
      >
        <FaUser />
      </button>

      {/* Popup para el formulario de inicio de sesión */}
      {isOpen && (
        <div className="absolute top-16 right-4 bg-white shadow-lg rounded-lg p-8 z-50 w-96">
          <h2 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-lg px-4 py-2"
                placeholder="Ingresa tu usuario"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-lg px-4 py-2"
                placeholder="Ingresa tu contraseña"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 rounded-lg text-lg font-medium hover:bg-blue-600 transition"
            >
              Login
            </button>
          </form>
        </div>
      )}

      {/* Mostrar mensajes dinámicos */}
      {message && <Message type={message.type} text={message.text} />}
    </div>
  );
}
