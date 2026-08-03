FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 5173

# --host expone el servidor de Vite en todas las interfaces del contenedor;
# sin esto, el puerto mapeado al host no llega al proceso.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
