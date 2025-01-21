import numpy as np
import matplotlib.pyplot as plt
from PIL import Image

def analyse_lsb(image_path, block_size=100):
    """
    Analiza una imagen para detectar esteganografía basada en LSB.

    Args:
        image_path (str): Ruta a la imagen a analizar.
        block_size (int): Tamaño de los bloques para promediar los LSBs.

    Returns:
        dict: Resultados del análisis con detalles de los promedios de LSB.
    """
    # Cargar la imagen
    img = Image.open(image_path)
    (width, height) = img.size
    print(f"[+] Tamaño de la imagen: {width}x{height} píxeles.")
    conv = img.convert("RGBA").getdata()

    # Extraer los LSBs de los canales de color
    vr, vg, vb = [], [], []  # LSB de los canales Rojo, Verde y Azul
    for h in range(height):
        for w in range(width):
            (r, g, b, a) = conv.getpixel((w, h))
            vr.append(r & 1)
            vg.append(g & 1)
            vb.append(b & 1)

    # Calcular el promedio de los LSBs por bloques
    avg_r, avg_g, avg_b = [], [], []
    for i in range(0, len(vr), block_size):
        avg_r.append(np.mean(vr[i:i + block_size]))
        avg_g.append(np.mean(vg[i:i + block_size]))
        avg_b.append(np.mean(vb[i:i + block_size]))

    # Generar el gráfico de los resultados
    num_blocks = len(avg_r)
    blocks = range(num_blocks)
    plt.figure(figsize=(10, 6))
    plt.plot(blocks, avg_r, 'r.', label='LSB Promedio - Rojo')
    plt.plot(blocks, avg_g, 'g.', label='LSB Promedio - Verde')
    plt.plot(blocks, avg_b, 'b.', label='LSB Promedio - Azul')
    plt.axhline(0.5, color='black', linestyle='--', label='Referencia (0.5)')
    plt.title("Análisis de LSB por Bloques")
    plt.xlabel("Número de Bloque")
    plt.ylabel("Promedio LSB")
    plt.legend()
    plt.show()

    # Interpretar resultados
    results = {
        "avg_r": avg_r,
        "avg_g": avg_g,
        "avg_b": avg_b,
        "suspect_blocks": sum(1 for x in avg_b if 0.45 < x < 0.55),
    }
    print(f"[+] Bloques sospechosos detectados: {results['suspect_blocks']} / {num_blocks}")
    return results

# Ejemplo de uso
if __name__ == "__main__":
    image_path = r"C:\Users\MATIAS\Downloads\ImagenesPrueba\imagen1estegano.png"
    results = analyse_lsb(image_path)
