# ----------------------------------------------------------------------
# STAGE 1: BUILD - Construye la aplicación React (Etapa Pesada)
# ----------------------------------------------------------------------
FROM node:20-alpine AS build-stage

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de definición de dependencias y los instala
COPY package.json package-lock.json ./
RUN npm install

# Copia el código fuente completo de la aplicación
COPY . .

# Ejecuta el comando de construcción de React para generar los archivos estáticos
RUN npm run build

# ----------------------------------------------------------------------
# STAGE 2: PRODUCTION - Servidor web ligero (Etapa Final)
# Usaremos NGINX, que es mucho más eficiente que 'serve' de Node
# ----------------------------------------------------------------------
FROM nginx:alpine AS production-stage

# Copia el archivo de configuración de NGINX personalizado (ver el paso 2)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia los archivos estáticos generados desde la etapa 'build-stage'
# La carpeta 'build' es donde React deja los archivos compilados
COPY --from=build-stage /app/build /usr/share/nginx/html

# Puerto por defecto de NGINX
EXPOSE 80

# Comando para iniciar NGINX
CMD ["nginx", "-g", "daemon off;"]
