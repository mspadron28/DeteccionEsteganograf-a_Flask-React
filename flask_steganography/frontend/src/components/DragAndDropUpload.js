import React, { useState } from 'react';
import axios from 'axios';
import '../styles/DragAndDropUpload.css';

function DragAndDropUpload({ showToast }) {
  const [originalFile, setOriginalFile] = useState(null);
  const [stegoFile, setStegoFile] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [comparisonResult, setComparisonResult] = useState(null);

  const validateFile = (file, type) => {
    if (!file) {
      showToast(`Por favor selecciona una imagen para ${type}.`, 'error');
      return false;
    }
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      showToast(`El archivo ${file.name} no es válido. Solo se permiten formatos PNG, JPG y JPEG.`, 'error');
      return false;
    }
    return true;
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (validateFile(file, type)) {
      type === 'original' ? setOriginalFile(file) : setStegoFile(file);
      showToast(`¡Archivo "${file.name}" listo para ${type === 'original' ? 'original' : 'esteganografía'}!`, 'success');
    }
  };

  const deleteImage = async (filename) => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/images');
      const image = response.data.find((img) => img.filename === filename);
      if (image) {
        await axios.delete(`http://127.0.0.1:5000/api/delete/${image.id}`);
        showToast(`Imagen "${filename}" eliminada correctamente.`, 'success');
      }
    } catch (error) {
      showToast('Error al eliminar la imagen.', 'error');
    }
  };

  const handleUpload = async () => {
    if (!originalFile || !stegoFile) {
      showToast('Por favor selecciona ambas imágenes antes de continuar.', 'error');
      return;
    }
    setIsUploading(true);

    try {
      const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axios.post('http://127.0.0.1:5000/api/upload', formData);
        return {
          suspiciousBlocks: response.data.suspicious_blocks,
          analysisImage: response.data.analysis_image,
          filename: file.name,
        };
      };

      const originalAnalysis = await uploadFile(originalFile);
      const stegoAnalysis = await uploadFile(stegoFile);

      setAnalysisData({
        original: originalAnalysis,
        stego: stegoAnalysis,
      });

      const result = originalAnalysis.suspiciousBlocks === stegoAnalysis.suspiciousBlocks;
      setComparisonResult(result);

      if (result) {
        showToast('Las imágenes coinciden. Puedes continuar.', 'success');
      } else {
        showToast('Las imágenes no coinciden. Eliminando imágenes no aprobadas.', 'error');
        await deleteImage(originalAnalysis.filename);
        await deleteImage(stegoAnalysis.filename);
      }
    } catch (error) {
      showToast(error.response?.data?.error || 'Error al subir las imágenes.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="upload-container">
      {!analysisData && (
        <>
          <div id="upload-section" className="upload-section">
            <div className="upload-box">
              <h3>Imagen Original</h3>
              <label htmlFor="original-upload" className="custom-file-upload">
                Seleccionar imagen
              </label>
              <input
                id="original-upload"
                type="file"
                accept="image/png, image/jpeg"
                onChange={(e) => handleFileChange(e, 'original')}
              />
              {originalFile && <p>{originalFile.name}</p>}
            </div>
            <div className="upload-box">
              <h3>Imagen con Esteganografía</h3>
              <label htmlFor="stego-upload" className="custom-file-upload">
                Seleccionar imagen
              </label>
              <input
                id="stego-upload"
                type="file"
                accept="image/png, image/jpeg"
                onChange={(e) => handleFileChange(e, 'stego')}
              />
              {stegoFile && <p>{stegoFile.name}</p>}
            </div>
            <button
              className="upload-button"
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? 'Subiendo...' : 'Subir Imágen'}
            </button>
          </div>
        </>
      )}

      {analysisData && (
        <div className="analysis-section">
          <div className="analysis-box">
            <h3>Análisis de Imagen Original</h3>
            <img
              src={`http://127.0.0.1:5000${analysisData.original.analysisImage}`}
              alt="Análisis Original"
              className="analysis-image"
            />
            <p>Bloques sospechosos: {analysisData.original.suspiciousBlocks}</p>
          </div>
          <div className="analysis-box">
            <h3>Análisis de Imagen con Esteganografía</h3>
            <img
              src={`http://127.0.0.1:5000${analysisData.stego.analysisImage}`}
              alt="Análisis Esteganografía"
              className="analysis-image"
            />
            <p>Bloques sospechosos: {analysisData.stego.suspiciousBlocks}</p>
          </div>
          <div className={`result-message ${comparisonResult ? 'success' : 'error'}`}>
            {comparisonResult
              ? 'Las imágenes coinciden. La imagen es válida para subir.'
              : 'Las imágenes no coinciden. Se detectó esteganografía. Las imágenes han sido eliminadas.'}
          </div>
        </div>
      )}
    </div>
  );
}

export default DragAndDropUpload;
