import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Toast from './Toast';
import '../styles/ImageGrid.css';

function ImageGrid() {
  const [images, setImages] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  }, []);

  const fetchImages = useCallback(() => {
    axios.get('http://127.0.0.1:5000/api/images')
      .then((response) => setImages(response.data))
      .catch(() => showToast('Error al cargar las imágenes.', 'error'));
  }, [showToast]);

  const deleteImage = (imageId) => {
    axios.delete(`http://127.0.0.1:5000/api/delete/${imageId}`)
      .then(() => {
        showToast('Imagen eliminada correctamente.', 'success');
        fetchImages(); // Refrescar la lista después de eliminar
      })
      .catch(() => showToast('Error al eliminar la imagen.', 'error'));
  };

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

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
            <p className="analysis-result">
              {image.suspicious_blocks === 0
                ? '✔ Sin datos ocultos detectados'
                : `✖ Bloques sospechosos detectados: ${image.suspicious_blocks}`}
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
