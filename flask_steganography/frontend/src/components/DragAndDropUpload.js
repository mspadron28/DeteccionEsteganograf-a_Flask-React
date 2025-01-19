import React, { useState } from 'react';
import axios from 'axios';
import '../styles/DragAndDropUpload.css';

function DragAndDropUpload({ refreshImages, showToast }) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const uploadedFile = e.dataTransfer.files[0];
    validateFile(uploadedFile);
  };

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    validateFile(uploadedFile);
  };

  const validateFile = (uploadedFile) => {
    if (!uploadedFile) {
      showToast('Por favor selecciona un archivo.', 'error');
      return;
    }

    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(uploadedFile.type)) {
      showToast('El archivo no es válido. Solo se permiten formatos PNG, JPG y JPEG.', 'error');
      return;
    }

    setFile(uploadedFile);
    showToast(`¡Archivo "${uploadedFile.name}" listo para subir!`, 'success');
  };

  const handleSubmit = () => {
    if (!file) {
      showToast('Por favor selecciona un archivo antes de subir.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    axios.post('http://127.0.0.1:5000/api/upload', formData)
      .then((response) => {
        showToast('¡Imagen subida y analizada exitosamente!', 'success');
        setFile(null);

        // Refrescar la página después de subir la imagen
        window.location.reload();
      })
      .catch((err) => {
        showToast(err.response?.data?.error || 'Error al subir la imagen.', 'error');
      });
  };

  return (
    <div className="upload-container">
      <div
        className={`drag-drop-zone ${isDragging ? 'dragging' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="drag-drop-content">
          <div className="icon-placeholder">
            <i className="fas fa-cloud-upload-alt"></i>
          </div>
          <p>Arrastra y suelta tu imagen aquí</p>
          <p className="supported-formats">Formatos soportados: PNG, JPG, JPEG</p>
          <label htmlFor="file-upload" className="custom-file-upload">
            O haz clic para seleccionar un archivo
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/png, image/jpeg"
            onChange={handleFileChange}
          />
          {file && <p className="file-name">Archivo seleccionado: {file.name}</p>}
        </div>
      </div>
      <button className="upload-button" onClick={handleSubmit}>
        Subir Imagen
      </button>
    </div>
  );
}

export default DragAndDropUpload;
