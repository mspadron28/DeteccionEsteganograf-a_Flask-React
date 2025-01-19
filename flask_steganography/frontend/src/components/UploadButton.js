import React, { useState } from 'react';
import axios from 'axios';

function UploadButton() {
  const [file, setFile] = useState(null);

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append('file', file);

    axios.post('http://127.0.0.1:5000/api/upload', formData)
      .then(response => alert(response.data.message))
      .catch(error => alert(error.response.data.error));
  };

  return (
    <div className="upload">
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleSubmit}>Subir Imagen</button>
    </div>
  );
}

export default UploadButton;
