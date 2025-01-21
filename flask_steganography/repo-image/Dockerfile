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
