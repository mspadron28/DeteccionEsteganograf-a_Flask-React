from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from models import db, Image, User
import os
from werkzeug.utils import secure_filename
from steganography import analyse_lsb
import logging
from flask_bcrypt import Bcrypt


app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = 'uploads/'
app.config['TEMP_FOLDER'] = 'temp/'
os.makedirs(app.config['TEMP_FOLDER'], exist_ok=True)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///images.db'
bcrypt = Bcrypt(app)
db.init_app(app)

# Crear la base de datos y el usuario admin si no existe
def create_admin_user():
    with app.app_context():
        db.create_all()
        admin_username = "admin"
        admin_password = bcrypt.generate_password_hash("admin123").decode("utf-8")

        if not User.query.filter_by(user_name=admin_username).first():
            admin_user = User(user_name=admin_username, password=admin_password, role="admin")
            db.session.add(admin_user)
            db.session.commit()
            print("Usuario administrador creado con éxito.")
        
@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return jsonify({"error": "Faltan credenciales"}), 400

        user = User.query.filter_by(user_name=username).first()

        if not user or not bcrypt.check_password_hash(user.password, password):
            return jsonify({"error": "Credenciales inválidas"}), 401

        if user.role != "admin":
            return jsonify({"error": "Acceso denegado. Solo los administradores pueden ingresar."}), 403

        return jsonify({"message": "Inicio de sesión exitoso", "role": user.role}), 200
    except Exception as e:
        logging.exception("Error en /api/login")
        return jsonify({"error": "Error interno del servidor.", "details": str(e)}), 500

@app.route('/api/images', methods=['GET'])
def get_images():
    images = Image.query.all()
    return jsonify([
        {"id": img.id, "filename": img.filename, "suspicious_blocks": img.suspicious_blocks}
        for img in images
    ])
    
@app.route('/api/delete/<int:image_id>', methods=['DELETE'])
def delete_image(image_id):
    """
    Elimina una imagen de la base de datos y del sistema de archivos.

    Args:
        image_id (int): ID de la imagen a eliminar.

    Returns:
        dict: Respuesta indicando el estado de la operación.
    """
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

        # Realizar análisis de esteganografía
        analysis_result = analyse_lsb(file_path, output_path=f"{app.config['UPLOAD_FOLDER']}/analysis_{filename}")
        suspicious_blocks = analysis_result["suspect_blocks"]
        output_path = analysis_result["output_path"]

        # Guardar resultados en la base de datos
        new_image = Image(filename=filename, suspicious_blocks=suspicious_blocks)
        db.session.add(new_image)
        db.session.commit()

        return jsonify({
            "message": "Imagen subida y analizada.",
            "filename": filename,
            "suspicious_blocks": suspicious_blocks,
            "analysis_image": f"/uploads/{os.path.basename(output_path)}"
        })

    else:
        return jsonify({"error": "Tipo de archivo no soportado. Usa PNG o JPG."}), 400

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/temp/<filename>')
def serve_temp_file(filename):
    temp_folder = app.config.get('TEMP_FOLDER', 'temp/')
    return send_from_directory(temp_folder, filename)

    
#ENPOINT PARA TRABJAR CON ALMAACENAMIENTO DE IMAGENES TEMPORALES
# Configurar logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

@app.route('/api/upload-temp', methods=['POST'])
def upload_temp_image():
    try:
        if 'file' not in request.files:
            logging.error("No se proporcionó ningún archivo.")
            return jsonify({"error": "No se proporcionó ningún archivo."}), 400

        file = request.files['file']
        if file.filename == '':
            logging.error("El archivo no tiene nombre.")
            return jsonify({"error": "El archivo no tiene nombre."}), 400

        if file and file.filename.lower().endswith(('png', 'jpg', 'jpeg')):
            filename = secure_filename(file.filename)
            temp_folder = app.config.get('TEMP_FOLDER', 'temp/')
            os.makedirs(temp_folder, exist_ok=True)
            file_path = os.path.join(temp_folder, filename)
            file.save(file_path)

            logging.info(f"Imagen {filename} subida temporalmente.")
            return jsonify({"message": "Imagen subida temporalmente.", "temp_image_path": f"/temp/{filename}"})
        else:
            logging.error("Tipo de archivo no soportado.")
            return jsonify({"error": "Tipo de archivo no soportado. Usa PNG o JPG."}), 400
    except Exception as e:
        logging.exception("Error en /api/upload-temp")
        return jsonify({"error": "Error interno del servidor.", "details": str(e)}), 500


@app.route('/api/temp-image', methods=['GET'])
def get_temp_image():
    try:
        temp_folder = app.config.get('TEMP_FOLDER', 'temp/')
        temp_images = os.listdir(temp_folder)
        if not temp_images:
            logging.warning("No hay imágenes temporales disponibles.")
            return jsonify({"error": "No hay imágenes temporales disponibles."}), 404

        latest_image = sorted(temp_images)[-1]  # Obtener la imagen más reciente
        logging.info(f"Imagen temporal más reciente: {latest_image}")
        return jsonify({"temp_image_url": f"http://127.0.0.1:5000/temp/{latest_image}"})
    except Exception as e:
        logging.exception("Error en /api/temp-image")
        return jsonify({"error": "Error interno del servidor.", "details": str(e)}), 500

@app.route('/api/analyze-temp', methods=['POST'])
def analyze_temp_image():
    try:
        data = request.get_json()
        image_path = data.get("imagePath")
        if not image_path:
            logging.error("No se proporcionó la ruta de la imagen.")
            return jsonify({"error": "No se proporcionó la ruta de la imagen."}), 400

        temp_folder = app.config.get('TEMP_FOLDER', 'temp/')
        full_path = os.path.join(temp_folder, os.path.basename(image_path))
        if not os.path.exists(full_path):
            logging.error(f"La imagen {image_path} no existe.")
            return jsonify({"error": "La imagen no existe."}), 404

        analysis_result = analyse_lsb(full_path, output_path=f"{temp_folder}/analysis_{os.path.basename(full_path)}")
        logging.info(f"Análisis completado para la imagen {image_path}.")
        return jsonify({
            "suspicious_blocks": analysis_result["suspect_blocks"],
            "analysis_image": f"/temp/analysis_{os.path.basename(full_path)}",
            "num_blocks": analysis_result["num_blocks"],
            
        })
    except Exception as e:
        logging.exception("Error en /api/analyze-temp")
        return jsonify({"error": "Error interno del servidor.", "details": str(e)}), 500


@app.route('/api/delete-temp', methods=['DELETE'])
def delete_temp_image():
    try:
        temp_folder = app.config.get('TEMP_FOLDER', 'temp/')
        temp_images = os.listdir(temp_folder)
        if not temp_images:
            logging.warning("No hay imágenes temporales para eliminar.")
            return jsonify({"error": "No hay imágenes temporales para eliminar."}), 404

        for temp_image in temp_images:
            os.remove(os.path.join(temp_folder, temp_image))
            logging.info(f"Imagen temporal {temp_image} eliminada.")

        return jsonify({"message": "Imágenes temporales eliminadas correctamente."})
    except Exception as e:
        logging.exception("Error en /api/delete-temp")
        return jsonify({"error": "Error interno del servidor.", "details": str(e)}), 500

@app.route('/api/approve-temp', methods=['POST'])
def approve_temp_image():
    try:
        data = request.get_json()
        image_path = data.get("imagePath")
        if not image_path:
            logging.error("No se proporcionó la ruta de la imagen.")
            return jsonify({"error": "No se proporcionó la ruta de la imagen."}), 400

        temp_folder = app.config.get('TEMP_FOLDER', 'temp/')
        full_temp_path = os.path.join(temp_folder, os.path.basename(image_path))
        if not os.path.exists(full_temp_path):
            logging.error(f"La imagen {image_path} no existe.")
            return jsonify({"error": "La imagen no existe."}), 404

        # Mover la imagen aprobada a la carpeta de uploads
        upload_folder = app.config.get('UPLOAD_FOLDER', 'uploads/')
        os.makedirs(upload_folder, exist_ok=True)
        upload_path = os.path.join(upload_folder, os.path.basename(image_path))
        os.rename(full_temp_path, upload_path)

        # Analizar la imagen en su nueva ubicación
        analysis_result = analyse_lsb(upload_path, output_path=f"{upload_folder}/analysis_{os.path.basename(upload_path)}")
        new_image = Image(filename=os.path.basename(image_path), suspicious_blocks=analysis_result["suspect_blocks"])
        db.session.add(new_image)
        db.session.commit()

        logging.info(f"Imagen {image_path} aprobada y movida a {upload_folder}.")

        # Limpiar la carpeta temp
        clear_temp_folder(temp_folder)

        return jsonify({"message": "Imagen aprobada y guardada correctamente."})
    except Exception as e:
        logging.exception("Error en /api/approve-temp")
        return jsonify({"error": "Error interno del servidor.", "details": str(e)}), 500


def clear_temp_folder(folder_path):
    """
    Elimina todos los archivos de la carpeta temporal.
    
    Args:
        folder_path (str): Ruta de la carpeta temporal.
    """
    try:
        for filename in os.listdir(folder_path):
            file_path = os.path.join(folder_path, filename)
            if os.path.isfile(file_path):
                os.remove(file_path)
                logging.info(f"Archivo eliminado de {folder_path}: {filename}")
    except Exception as e:
        logging.exception(f"Error al limpiar la carpeta temporal {folder_path}: {str(e)}")
    
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        create_admin_user()
    app.run(debug=True)