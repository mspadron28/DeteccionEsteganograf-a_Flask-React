import React from 'react';
import './styles/App.css'; // Importa los estilos
import ImageGrid from './components/ImageGrid'; // Componente para mostrar imágenes
import UploadButton from './components/UploadButton'; // Componente para cargar imágenes

function App() {
  return (
    <div className="App">
      {/* Header */}
      <header className="App-header">
        <h1>Repositorio de Imágenes 100% Seguras</h1>
        <p>Garantizamos que tus imágenes están libres de esteganografía</p>
      </header>

      {/* Botón para cargar imágenes */}
      <div className="Upload-section">
        <UploadButton />
      </div>

      {/* Grid de imágenes */}
      <main>
        <ImageGrid />
      </main>
    </div>
  );
}

export default App;
