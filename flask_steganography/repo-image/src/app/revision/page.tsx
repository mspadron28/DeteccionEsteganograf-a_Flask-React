"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  FaExclamationTriangle,
  FaCheckCircle,
  FaQuestionCircle,
  FaExclamationCircle,
} from "react-icons/fa";

import Message from "../ui/Message";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import Image from "next/image";
export default function RevisionPage() {
  const [tempImageURL, setTempImageURL] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<{
    suspiciousBlocks: number;
    analysisImage: string;
    num_blocks: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [approved, setApproved] = useState<boolean | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const router = useRouter();

  // Obtener URL de imagen temporal al cargar el componente
  useEffect(() => {
    const fetchTempImage = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:5000/api/temp-image"
        );
        setTempImageURL(response.data.temp_image_url);
      } catch (error) {
        console.error("Error al obtener la imagen temporal:", error);
        setMessage({
          type: "info",
          text: "No hay imágenes pendientes de revisión.",
        });
        setTimeout(() => router.push("/"), 2000);
      }
    };

    fetchTempImage();
  }, [router]);

  // Analizar imagen temporal
  const handleAnalyze = async () => {
    if (!tempImageURL) return;

    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/api/analyze-temp",
        {
          imagePath: tempImageURL,
        }
      );
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
      await axios.post("http://127.0.0.1:5000/api/approve-temp", {
        imagePath: tempImageURL,
      });
      setMessage({
        type: "success",
        text: "La imagen ha sido aprobada y movida al repositorio.",
      });
      setApproved(true);
      setTimeout(() => router.push("/"), 2000);
    } catch (error) {
      console.error("Error al aprobar la imagen:", error);
      setMessage({ type: "error", text: "Error al aprobar la imagen." });
    }
  };

  // Rechazar y eliminar imagen temporal
  const handleReject = async () => {
    try {
      await axios.delete("http://127.0.0.1:5000/api/delete-temp");
      setMessage({
        type: "success",
        text: "La imagen ha sido rechazada y eliminada.",
      });
      setApproved(false);
      setTimeout(() => router.push("/"), 2000);
    } catch (error) {
      console.error("Error al eliminar la imagen:", error);
      setMessage({ type: "error", text: "Error al eliminar la imagen." });
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Revisión de Imágenes
      </h2>

      {message && <Message type={message.type} text={message.text} />}

      {tempImageURL && (
        <div className="flex flex-col items-center gap-4">
          {/* Imagen temporal */}
          <img
            src={tempImageURL}
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
        <div className="flex flex-col items-center gap-6 mt-6 bg-cyan-50 p-6 rounded-lg shadow-md">
          {/* Resultado del análisis */}
          <Card className="w-full max-w-3xl bg-white shadow-lg">
            <CardHeader>
              <CardTitle>Análisis de la Imagen</CardTitle>
              <CardDescription>
                Resultados del análisis de esteganografía aplicado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Imagen de análisis */}
              <div className="flex justify-center mb-4">
                <Image
                  src={`http://127.0.0.1:5000/${analysisData.analysisImage}`}
                  alt="Análisis de la Imagen"
                  width={800}
                  height={450}
                  className="rounded-lg object-contain"
                />
              </div>

              {/* Resumen del análisis */}
              <p className="text-lg text-center font-medium">
                Se han detectado{" "}
                <strong>{analysisData.suspiciousBlocks}</strong> bloques
                sospechosos de un total de{" "}
                <strong>{analysisData.num_blocks}</strong> bloques analizados.
              </p>

              {/* Explicación de la distribución */}
              <div className="mt-4 text-gray-700 text-sm leading-relaxed">
                <p className="text-center font-semibold mb-2">
                  Interpretación del análisis:
                </p>
                <p className="text-justify">
                  Un bloque se considera <strong>"sospechoso"</strong> si sus
                  bits menos significativos (LSBs) muestran una distribución
                  cercana a 0.5, lo que indica una posible presencia de datos
                  cifrados ocultos. Esto es típico cuando se emplea
                  esteganografía para ocultar datos cifrados, ya que los valores
                  se distribuyen de manera más uniforme.
                </p>
                <div className="mt-4 pl-6 text-sm text-gray-700">
                  <p className="text-center font-semibold mb-2">
                    Criterios de decisión:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <FaQuestionCircle className="text-blue-500" />
                      <span>
                        <strong>Promedio mayor a 0.5:</strong> Podría indicar
                        alteraciones deliberadas en los valores.
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <FaCheckCircle className="text-green-500" />
                      <span>
                        <strong>Promedio menor a 0.5:</strong> Sugiere valores
                        naturales o no modificados.
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <FaExclamationTriangle className="text-yellow-500" />
                      <span>
                        <strong>Promedio ≈ 0.5:</strong> Indica posible
                        presencia de datos cifrados ocultos.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Nueva sección: A tomar en cuenta */}
              <div className="mt-8 p-4 bg-yellow-100 border-l-4 border-yellow-500 rounded-lg shadow-md flex items-start gap-4">
                <FaExclamationCircle className="text-yellow-500 text-2xl" />
                <div>
                  <h3 className="font-semibold text-lg text-yellow-700">
                    A tomar en cuenta
                  </h3>
                  <p className="text-gray-800 mt-1">
                    Como administrador, es importante verificar que el número de{" "}
                    <strong>bloques sospechosos</strong> no coincida con el
                    número total de <strong>bloques analizados</strong>. Si
                    ambos valores son idénticos, esto puede indicar una
                    alteración significativa en la imagen y, por lo tanto, la
                    presencia de <strong>esteganografía</strong>.
                  </p>
                  <p className="text-gray-800 mt-2">
                    Analice cuidadosamente los gráficos y datos presentados, y
                    utilice esta información para justificar la{" "}
                    <strong>aprobación</strong> o <strong>rechazo</strong> de la
                    imagen. Una decisión adecuada es fundamental para garantizar
                    la precisión del análisis.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center gap-4 mt-4">
              {/* Botones de acción */}
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
            </CardFooter>
          </Card>
        </div>
      )}  
    </div>
  );
}
