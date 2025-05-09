# Utiliza una imagen base de Node.js 14.18
FROM node:16.20-alpine

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

# Copia el package.json y el package-lock.json (si existe)
COPY package*.json ./

# Instala las dependencias del proyecto
RUN npm install

# Instala dependencias adicionales
RUN npm install react-select reactjs-popup

# Copia el resto de los archivos del proyecto al contenedor
COPY . .

# Compila la aplicación para producción
RUN npm run build

# Expone el puerto en el que la aplicación se ejecutará
EXPOSE 5173

# Comando para correr la aplicación
CMD ["npm", "run", "dev"]