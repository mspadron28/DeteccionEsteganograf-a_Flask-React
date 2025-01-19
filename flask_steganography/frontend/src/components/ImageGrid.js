import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ImageGrid() {
  const [images, setImages] = useState([]);

  // Función para cargar las imágenes
  const fetchImages = () => {
    axios.get('http://127.0.0.1:5000/api/images')
      .then(response => setImages(response.data))
      .catch(error => console.error(error));
  };

  // Función para eliminar una imagen
  const deleteImage = (imageId) => {
    axios.delete(`http://127.0.0.1:5000/api/delete/${imageId}`)
      .then(() => {
        alert('Imagen eliminada correctamente.');
        fetchImages(); // Recargar la lista de imágenes
      })
      .catch(error => {
        console.error(error);
        alert('Error al eliminar la imagen.');
      });
  };

  // Cargar imágenes al cargar el componente
  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <div className="grid">
      {images.map(image => (
        <div className="card" key={image.id}>
          <img src={`http://127.0.0.1:5000/uploads/${image.filename}`} alt={image.filename} />
          <div className="card-body">
            <h5>{image.filename}</h5>
            {image.is_safe ? (
              <p className="safe">✔ 100% confiable: Sin esteganografía</p>
            ) : (
              <p className="unsafe">✖ No confiable</p>
            )}
            <button
              className="btn btn-danger"
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
