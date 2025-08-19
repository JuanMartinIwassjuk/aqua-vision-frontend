# =====================
# Stage 1: Build Angular
# =====================
FROM node:20-alpine AS build

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Build de producción usando la configuración moderna
RUN ng build --configuration production

# =====================
# Stage 2: Serve con Nginx
# =====================
FROM nginx:alpine

# Copiar los archivos compilados de Angular a Nginx
COPY --from=build /app/dist/aquavision-front /usr/share/nginx/html

# Copiar configuración de Nginx para SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 80
EXPOSE 80

# Comando para correr Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
