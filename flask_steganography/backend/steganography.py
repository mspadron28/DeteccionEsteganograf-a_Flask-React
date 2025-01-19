import os
import struct

# Diccionario de firmas de archivos conocidos
FILE_SIGNATURES = {
    b"\x89PNG\r\n\x1a\n": ("png", 8),  # PNG
    b"\xFF\xD8\xFF": ("jpg", 0),      # JPG
}

def validate_hidden_data(content, end_marker):
    """
    Valida los datos ocultos tras el marcador de fin.
    """
    end_of_file = content.find(end_marker) + len(end_marker)
    hidden_data = content[end_of_file:]
    if hidden_data and not hidden_data.isspace() and len(hidden_data) > 10:
        return hidden_data
    return None

def scan_for_steganography(file_path):
    """
    Escanea el archivo completo en busca de cabeceras y datos ocultos.
    """
    try:
        with open(file_path, "rb") as f:
            content = f.read()
            detected_headers = []
            
            # Escaneo inicial de cabeceras
            for signature, (file_type, offset) in FILE_SIGNATURES.items():
                if content.startswith(signature, offset):
                    detected_headers.append((file_type, offset))
            
            # Buscar datos ocultos en PNG y JPG
            if b"IEND" in content:  # Fin de PNG
                hidden_data = validate_hidden_data(content, b"IEND")
            elif b"\xFF\xD9" in content:  # Fin de JPG
                hidden_data = validate_hidden_data(content, b"\xFF\xD9")
            else:
                hidden_data = None

            if hidden_data:
                return f"Datos ocultos detectados: {len(hidden_data)} bytes"
            if detected_headers:
                return "No se detectaron datos ocultos."
            return "Archivo seguro: sin esteganografía detectada."
    except Exception as e:
        return f"Error al analizar el archivo: {e}"
