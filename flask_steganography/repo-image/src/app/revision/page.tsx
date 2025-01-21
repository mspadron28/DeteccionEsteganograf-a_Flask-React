"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Message from "../ui/Message";

export default function RevisionPage() {
  const [tempImageURL, setTempImageURL] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<{
    suspiciousBlocks: number;
    analysisImage: string;
    num_blocks: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [approved, setApproved] = useState<boolean | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  const router = useRouter();

  // Obtener URL de imagen temporal al cargar el componente
  useEffect(() => {
    const fetchTempImage = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/api/temp-image");
        setTempImageURL(response.data.temp_image_url); // URL completa de la imagen temporal
      } catch (error) {
        console.error("Error al obtener la imagen temporal:", error);
        setMessage({ type: "info", text: "No hay imágenes pendientes de revisión." });
        setTimeout(() => router.push("/"), 2000); // Redirigir al home después de 2 segundos
      }
    };

    fetchTempImage();
  }, [router]);

  // Analizar imagen temporal
  const handleAnalyze = async () => {
    if (!tempImageURL) return;

    setIsLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:5000/api/analyze-temp", {
        imagePath: tempImageURL,
      });
      setAnalysisData({
        suspiciousBlocks: response.data.suspicious_blocks,
        analysisImage: response.data.analysis_image,
        num_blocks: response.data.num_blocks,
      });
      setMessage({ type: "success", text: "Análisis completado con éxito." });
    } catch (error) {
      console.error("Error al analizar la imagen:", error);
      setMessage({ type: "error", text: "Error al analizar la imagen." });
    } finally {
      setIsLoading(false);
    }
  };

  // Aprobar imagen temporal
  const handleApprove = async () => {
    if (!tempImageURL) return;

    try {
      await axios.post("http://127.0.0.1:5000/api/approve-temp", { imagePath: tempImageURL });
      setMessage({ type: "success", text: "La imagen ha sido aprobada y movida al repositorio." });
      setApproved(true);
      setTimeout(() => router.push("/"), 2000); // Redirigir al home después de 2 segundos
    } catch (error) {
      console.error("Error al aprobar la imagen:", error);
      setMessage({ type: "error", text: "Error al aprobar la imagen." });
    }
  };

  // Rechazar y eliminar imagen temporal
  const handleReject = async () => {
    try {
      await axios.delete("http://127.0.0.1:5000/api/delete-temp");
      setMessage({ type: "success", text: "La imagen ha sido rechazada y eliminada." });
      setApproved(false);
      setTimeout(() => router.push("/"), 2000); // Redirigir al home después de 2 segundos
    } catch (error) {
      console.error("Error al eliminar la imagen:", error);
      setMessage({ type: "error", text: "Error al eliminar la imagen." });
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Revisión de Imágenes</h2>

      {message && <Message type={message.type} text={message.text} />}

      {tempImageURL && (
        <div className="flex flex-col items-center gap-4">
          {/* Imagen temporal */}
          <img
            src={tempImageURL} // URL de la imagen temporal
            alt="Imagen pendiente"
            className="w-full max-w-md rounded-lg shadow-lg"
          />
          <button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isLoading ? "Analizando..." : "Comprobar"}
          </button>
        </div>
      )}

      {analysisData && (
        <div className="flex flex-col items-center gap-6 mt-6">
          {/* Resultado del análisis */}
          <img
            src={`http://127.0.0.1:5000/${analysisData.analysisImage}`}
            alt="Análisis de la Imagen"
            className="w-full rounded-lg"
          />
          <p className="mt-4 text-center">
            Bloques sospechosos detectados vs Bloques detectados:{" "}
            <span className="font-bold">{analysisData.suspiciousBlocks}/{analysisData.num_blocks}</span>
          </p>
          {/* Botones de acción */}
          <div className="flex gap-4">
            <button
              onClick={handleApprove}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
            >
              Aprobar
            </button>
            <button
              onClick={handleReject}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              Rechazar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
