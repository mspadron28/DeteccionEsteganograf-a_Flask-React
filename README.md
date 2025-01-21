# Flask Steganography

Este proyecto es una aplicación web para la detección y creación de esteganografía. Combina un backend en Flask con un frontend basado en Next.js.

## Estructura del Proyecto

- **Backend:** Implementado en Flask, proporciona la API para gestionar imágenes, analizar esteganografía y almacenar resultados.
- **Frontend:** Implementado en Next.js, proporciona la interfaz de usuario para interactuar con el sistema.

---

## Instalación

### Backend

1. **Clona el repositorio:**

   ```sh
   git clone <URL_DEL_REPOSITORIO>
   cd flask_steganography/backend
   ```

2. **Crea y activa un entorno virtual:**

   ```sh
   python -m venv venv
   source venv/bin/activate  # En Windows usa `venv\Scripts\activate`
   ```

3. **Instala las dependencias:**

   ```sh
   pip install -r requirements.txt
   ```

4. **Inicia el servidor Flask:**

   ```sh
   flask run
   ```

   El servidor estará disponible en `http://127.0.0.1:5000`.

---

### Frontend

1. **Navega al directorio del frontend:**

   ```sh
   cd flask_steganography/repo-image
   ```

2. **Instala las dependencias:**

   ```sh
   npm install
   ```

3. **Ejecuta la aplicación:**

   ```sh
   npm start
   ```

   La interfaz estará disponible en `http://127.0.0.1:3000`.

---

## Uso

1. Abre tu navegador y accede a `http://127.0.0.1:3000` para la interfaz de usuario.
2. Sube imágenes y realiza operaciones de esteganografía usando la interfaz gráfica.

---

# Flask Steganography Frontend Deployment Guide

Este proyecto incluye una aplicación frontend basada en Next.js que se puede ejecutar de manera local o utilizando Docker.

---

## Instalación Local

1. **Clona el repositorio:**

   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd flask_steganography/repo-image
   ```

2. **Instala las dependencias:**

   ```bash
   npm install
   ```

3. **Inicia la aplicación:**

   ```bash
   npm start
   ```

   La interfaz estará disponible en `http://127.0.0.1:3000`.

---

## Uso con Docker

La configuración para ejecutar el frontend con Docker ya está preparada.

### Construcción de la Imagen Docker

Para construir la imagen Docker, utiliza el siguiente comando:

```bash
docker build -t repo-app .
```

Esto generará una imagen llamada `repo-app` basada en el archivo `Dockerfile` proporcionado.

---

### Uso de Docker Compose

El archivo `docker-compose.yml` está configurado para ejecutar el frontend con la imagen `repo-app:latest`.

1. **Ejecuta Docker Compose:**

   ```bash
   docker-compose up
   ```

2. **Accede a la aplicación:**

   La interfaz estará disponible en `http://127.0.0.1:3000`.

---

### Archivo `Dockerfile`

Este archivo define cómo construir la imagen Docker para la aplicación:

```dockerfile
# Usar la imagen oficial de Node.js como base
FROM node:18-alpine

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar solo los archivos necesarios para instalar dependencias
COPY package.json package-lock.json ./

# Instalar las dependencias de producción
RUN npm install

# Copiar todo el código del proyecto al contenedor
COPY . .

# Construir la aplicación Next.js
RUN npm run build

# Exponer el puerto en el que correrá la app
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"]
```

---

### Archivo `docker-compose.yml`

El archivo `docker-compose.yml` define cómo ejecutar la aplicación en un contenedor Docker usando la imagen `repo-app`.

```yaml
version: '3.8'
services:
  app:
    image: repo-app:latest  # Usa la imagen existente
    ports:
      - "3000:3000"         # Mapea el puerto 3000 del contenedor al 3000 de tu máquina
    volumes:
      - .:/app              # Monta el código fuente local en el contenedor
      - /app/node_modules   # Evita conflictos con node_modules en el host
    command: npm start      # Comando para iniciar la aplicación
```

---

## Notas Adicionales

- Asegúrate de que tienes Docker y Docker Compose instalados en tu máquina.
- Si realizas cambios en el código fuente, asegúrate de reconstruir la imagen Docker utilizando `docker build -t repo-app .`.

---

