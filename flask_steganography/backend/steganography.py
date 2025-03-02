import matplotlib
matplotlib.use('Agg')  # Usar backend no interactivo
import numpy as np
import matplotlib.pyplot as plt
from PIL import Image

def analyse_lsb(image_path, block_size=100, output_path="lsb_analysis.png"):
    """
    Analiza una imagen para detectar esteganografía basada en LSB y genera un gráfico.

    Args:
        image_path (str): Ruta a la imagen a analizar.
        block_size (int): Tamaño de los bloques para promediar los LSBs.
        output_path (str): Ruta para guardar la imagen generada del análisis.

    Returns:
        dict: Resultados del análisis con detalles de los bloques sospechosos y el gráfico generado.
    """
    # Cargar la imagen
    img = Image.open(image_path)
    (width, height) = img.size
    print(f"[+] Tamaño de la imagen: {width}x{height} píxeles.")
    conv = img.convert("RGBA").getdata()  # Convertir siempre a RGBA para consistencia

    # Extraer los LSBs de los canales de color
    vr, vg, vb = [], [], []  # LSB de los canales Rojo, Verde y Azul
    for h in range(height):
        for w in range(width):
            pixel = conv.getpixel((w, h))
            if len(pixel) == 4:  # Si tiene canal alfa (RGBA)
                r, g, b, a = pixel
            else:  # Si no tiene canal alfa (RGB)
                r, g, b = pixel
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
    plt.savefig(output_path)  # Guardar el gráfico
    plt.close()  # Cerrar la figura

    # Interpretar resultados
    results = {
        "avg_r": avg_r,
        "avg_g": avg_g,
        "avg_b": avg_b,
        "suspect_blocks": sum(1 for x in avg_r + avg_g + avg_b if 0.45 < x < 0.55),
        "output_path": output_path,
        "num_blocks": num_blocks,
    }
    print(f"[+] Bloques sospechosos detectados: {results['suspect_blocks']} / {num_blocks}")
    return results
