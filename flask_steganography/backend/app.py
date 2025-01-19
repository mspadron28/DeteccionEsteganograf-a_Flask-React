from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from models import db, Image
import os
from werkzeug.utils import secure_filename
from steganography import scan_for_steganography

app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = 'uploads/'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///images.db'
db.init_app(app)

@app.route('/api/images', methods=['GET'])
def get_images():
    images = Image.query.all()
    return jsonify([
        {"id": img.id, "filename": img.filename, "is_safe": img.is_safe}
        for img in images
    ])
    
@app.route('/api/delete/<int:image_id>', methods=['DELETE'])
def delete_image(image_id):
    # Buscar la imagen en la base de datos
    image = Image.query.get(image_id)
    if not image:
        return jsonify({"error": "Imagen no encontrada."}), 404

    # Eliminar el archivo físico si existe
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], image.filename)
    if os.path.exists(file_path):
        os.remove(file_path)

    # Eliminar la imagen de la base de datos
    db.session.delete(image)
    db.session.commit()

    return jsonify({"message": "Imagen eliminada correctamente."})

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/upload', methods=['POST'])
def upload_image():
    if 'file' not in request.files:
        return jsonify({"error": "No se proporcionó ningún archivo."}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "El archivo no tiene nombre."}), 400

    if file and file.filename.lower().endswith(('png', 'jpg', 'jpeg')):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        # Verificar esteganografía
        result = scan_for_steganography(file_path)
        if "Archivo seguro" in result:
            new_image = Image(filename=filename, is_safe=True)
            db.session.add(new_image)
            db.session.commit()
            return jsonify({"message": "Imagen subida y verificada como segura.", "is_safe": True})
        elif "Datos ocultos detectados" in result:
            os.remove(file_path)
            return jsonify({"error": f"{result}. El archivo no es seguro.", "is_safe": False}), 400
        else:
            os.remove(file_path)
            return jsonify({"error": "Error en el análisis. No se pudo verificar el archivo.", "is_safe": False}), 400
    else:
        return jsonify({"error": "Tipo de archivo no soportado. Usa PNG o JPG."}), 400

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
