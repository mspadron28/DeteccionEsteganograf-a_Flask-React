import React, { useState } from 'react';
import './styles/App.css';
import ImageGrid from './components/ImageGrid';
import DragAndDropUpload from './components/DragAndDropUpload';
import Toast from './components/Toast';

function App() {
  const [toast, setToast] = useState(null); // Estado para manejar notificaciones

  const showToast = (message, type) => {
    setToast({ message, type });

    // Ocultar el toast automáticamente después de 5 segundos
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Repositorio de Imágenes 100% Seguras</h1>
        <p>Garantizamos que tus imágenes están libres de esteganografía</p>
      </header>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <DragAndDropUpload refreshImages={() => {}} showToast={showToast} />
      <main>
        <ImageGrid refreshImages={() => {}} showToast={showToast} />
      </main>
    </div>
  );
}

export default App;
