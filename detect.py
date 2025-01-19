import os
import struct

# Diccionario de firmas de archivos conocidos con validaciones adicionales
FILE_SIGNATURES = {
    b"\x89PNG\r\n\x1a\n": ("png", 8),  # PNG: Cabecera estándar
    b"MZ": ("exe", 0),                # EXE: Firma de archivos ejecutables
    b"\xFF\xD8\xFF": ("jpg", 0),      # JPG: Cabecera JPEG
}

def validate_exe_structure(content, offset):
    """
    Valida si los datos detectados como .exe corresponden a un archivo ejecutable.
    Busca la estructura PE ('PE\0\0') tras la cabecera 'MZ'.
    """
    try:
        # Leer los próximos bytes para validar estructura de un archivo ejecutable
        pe_offset = struct.unpack_from("I", content, offset + 60)[0]  # Offset a la cabecera PE
        if content[pe_offset:pe_offset + 4] == b"PE\x00\x00":
            return True
    except Exception:
        pass
    return False

def extract_hidden_data(file_path):
    """
    Extrae y analiza los datos ocultos al final del archivo.
    """
    try:
        with open(file_path, "rb") as f:
            content = f.read()  # Leer todo el archivo
            # Buscar datos tras el final del archivo válido
            end_of_png = content.find(b"IEND") + 8  # 'IEND' es el marcador de fin en PNG
            hidden_data = content[end_of_png:]
            if hidden_data:
                return hidden_data
            else:
                return None
    except Exception as e:
        print(f"Error al extraer datos ocultos: {e}")
        return None

def scan_for_steganography(file_path):
    """
    Escanea el archivo completo en busca de cabeceras incrustadas y datos ocultos.
    """
    try:
        with open(file_path, "rb") as f:
            content = f.read()
            detected_headers = []
            
            # Escaneo inicial de cabeceras en todo el archivo
            for signature, (file_type, _) in FILE_SIGNATURES.items():
                positions = [i for i in range(len(content)) if content.startswith(signature, i)]
                for pos in positions:
                    # Validar .exe específicamente
                    if file_type == "exe" and not validate_exe_structure(content, pos):
                        continue
                    detected_headers.append((file_type, pos))
            
            # Buscar datos ocultos
            hidden_data = extract_hidden_data(file_path)
            if hidden_data:
                detected_headers.append(("hidden_data", "final del archivo"))

            if detected_headers:
                result = "Cabeceras incrustadas detectadas:\n"
                for file_type, pos in detected_headers:
                    result += f" - {file_type} en posición {pos}\n"
                return result
            else:
                return "No se detectaron cabeceras incrustadas ni datos ocultos."
    except Exception as e:
        return f"Error al escanear el archivo: {e}"

# Prueba del algoritmo
if __name__ == "__main__":
    file_path = input("Ingresa la ruta del archivo a analizar: ")
    print("\n--- Escaneo de datos incrustados ---")
    print(scan_for_steganography(file_path))
