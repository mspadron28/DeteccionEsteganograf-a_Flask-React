"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaImages } from "react-icons/fa";
import LoginFormPopUp from "./ui/LoginFormPopUp";
import axios from "axios";

// Definir el tipo para las imágenes
interface Image {
  id: number;
  filename: string;
  suspicious_blocks: number;
}

// Imágenes quemadas
const itemData = [
  {
    img: "https://plus.unsplash.com/premium_photo-1682125180774-6792938ac2a5",
    title: "Bed",
  },
  {
    img: "https://i.pinimg.com/1200x/ce/25/6f/ce256f49bac0c64994ede6b37bf75676.jpg",
    title: "Books",
  },
  {
    img: "https://plus.unsplash.com/premium_photo-1682125164600-e7493508e496",
    title: "Sink",
  },
  {
    img: "https://images.unsplash.com/photo-1652172264794-a83fe7c190f3",
    title: "Kitchen",
  },
  {
    img: "https://images.unsplash.com/photo-1688902105223-464dfb5653bf",
    title: "Blinds",
  },
  {
    img: "https://images.unsplash.com/photo-1689016466319-f77129f1a7b6",
    title: "Chairs",
  },
];

export default function Home() {
  const [images, setImages] = useState<Image[]>([]);
  const [error, setError] = useState("");

  // Fetch imágenes desde el backend
  const fetchImages = useCallback(() => {
    axios
      .get<Image[]>("http://127.0.0.1:5000/api/images")
      .then((response) => {
        setImages(response.data);
      })
      .catch((err) => {
        console.error("Error al cargar las imágenes:", err);
        setError("No se pudieron cargar las imágenes desde el servidor.");
      });
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  return (
    <div className="p-6 relative bg-gray-100 min-h-screen">
      {/* Header con el título e icono alineados */}
      <header className="text-center mb-12">
      <LoginFormPopUp />
        <h1 className="text-5xl font-bold flex justify-center items-center gap-3 mb-6 text-blue-600">
          <FaImages />
          Repositorio de Imágenes
        </h1>
        
        {/* Botón "Subir Fotos" con el icono de login pegado */}
        <div className="flex justify-center items-center gap-4">
          <Link href="/imagenes">
            <Button className="px-6 py-3 text-lg font-medium">
              Subir Fotos
            </Button>
          </Link>
         
        </div>
       
      </header>

      {/* Sección de imágenes */}
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mx-auto max-w-screen-xl">
        {/* Imágenes quemadas */}
        {itemData.map((item, index) => (
          <div
            key={index}
            className="relative rounded-lg overflow-hidden shadow-lg bg-white"
          >
            <img
              src={item.img}
              alt={item.title}
              className="object-cover w-full h-48"
            />
            <div className="absolute bottom-0 left-0 bg-black bg-opacity-50 text-white w-full p-2 text-sm">
              {item.title}
            </div>
          </div>
        ))}

        {/* Imágenes desde el backend */}
        {images.map((image) => (
          <div
            key={image.id}
            className="relative rounded-lg overflow-hidden shadow-lg bg-white"
          >
            <img
              src={`http://127.0.0.1:5000/uploads/${image.filename}`}
              alt={image.filename}
              className="object-cover w-full h-48"
            />
            <div className="absolute bottom-0 left-0 bg-black bg-opacity-50 text-white w-full p-2 text-sm">
              {image.filename}
            </div>
          </div>
        ))}
      </main>

      {/* Mostrar error si ocurre */}
      {error && (
        <p className="text-red-500 text-center mt-6 text-lg font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
