import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Toast from './Toast'; // Importar el componente Toast
import '../styles/ImageGrid.css'; // Estilos personalizados

function ImageGrid({ refreshImages }) {
  const [images, setImages] = useState([]);
  const [toast, setToast] = useState(null); // Estado para manejar el mensaje de notificación

  // Envolver showToast en useCallback
  const showToast = useCallback((message, type) => {
    setToast({ message, type });

    // Ocultar el toast automáticamente después de 5 segundos
    setTimeout(() => {
      setToast(null);
    }, 5000);
  }, []);

  // Definir fetchImages con useCallback
  const fetchImages = useCallback(() => {
    axios.get('http://127.0.0.1:5000/api/images')
      .then((response) => setImages(response.data))
      .catch(() => showToast('Error al cargar las imágenes.', 'error'));
  }, [showToast]); // Agregar showToast como dependencia

  const deleteImage = (imageId) => {


    axios.delete(`http://127.0.0.1:5000/api/delete/${imageId}`)
      .then(() => {
        showToast('Imagen eliminada correctamente.', 'success');
        refreshImages(); // Actualizar el grid
      })
      .catch(() => showToast('Error al eliminar la imagen.', 'error'));
  };

  useEffect(() => {
    fetchImages();
  }, [fetchImages]); // Agregar fetchImages como dependencia

  return (
    <div className="grid">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {images.map((image) => (
        <div className="card" key={image.id}>
          <img
            src={`http://127.0.0.1:5000/uploads/${image.filename}`}
            alt={image.filename}
            className="card-image"
          />
          <div className="card-body">
            <h5 className="card-title">{image.filename}</h5>
            <p className={image.is_safe ? 'safe' : 'unsafe'}>
              {image.is_safe ? '✔ 100% confiable: Sin esteganografía' : '✖ No confiable'}
            </p>
            <button
              className="delete-button"
              onClick={() => deleteImage(image.id)}
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ImageGrid;
