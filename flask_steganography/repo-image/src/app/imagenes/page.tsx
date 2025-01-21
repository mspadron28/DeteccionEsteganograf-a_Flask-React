"use client";

import { useState } from "react";
import axios from "axios";
import Message from "../ui/Message";

export default function UploadPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  const uploadTempFile = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post("http://127.0.0.1:5000/api/upload-temp", formData);
      console.log("Temp image response:", response.data);
      return response.data.temp_image_path;
    } catch (error) {
      console.error("Error al subir la imagen temporal:", error);
      throw new Error("Error al subir la imagen temporal.");
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar extensión del archivo
    const allowedExtensions = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedExtensions.includes(file.type)) {
      setMessage({ type: "error", text: "Solo se permiten archivos PNG, JPG o JPEG." });
      return;
    }

    setIsUploading(true);

    try {
      const tempImagePath = await uploadTempFile(file);
      setMessage({ type: "success", text: "Tu imagen fue subida para revisión. Espera pronto su aprobación para ser parte de la galería." });
      setTimeout(() => {
        window.location.href = "/"; // Redirige al home después de 2 segundos
      }, 2000);
    } catch (error) {
      setMessage({ type: "error", text: "Hubo un error al subir la imagen temporal." });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <h2 className="text-2xl font-bold mb-4">Sube tu imagen</h2>
      <p className="mb-4 text-sm text-gray-600">Solo se permiten archivos PNG, JPG y JPEG.</p>
      <input
        type="file"
        accept="image/png, image/jpeg"
        onChange={handleUpload}
        className="file-input border border-gray-300 rounded-md p-2"
      />
      {isUploading && <p className="mt-2 text-blue-500">Subiendo...</p>}

      {/* Mostrar mensaje dinámico */}
      {message && <Message type={message.type} text={message.text} />}
    </div>
  );
}
