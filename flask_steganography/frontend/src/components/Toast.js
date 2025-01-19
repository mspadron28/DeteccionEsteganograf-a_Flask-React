import React from 'react';
import '../styles/Toast.css'; // Estilos personalizados para el Toast

function Toast({ message, type, onClose }) {
  return (
    <div className={`toast ${type}`}>
      <p>{message}</p>
      <button className="close-btn" onClick={onClose}>×</button>
    </div>
  );
}

export default Toast;
