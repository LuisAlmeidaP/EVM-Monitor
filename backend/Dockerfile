FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000

# Corre las migraciones (idempotente: TypeORM lleva registro de las ya
# aplicadas) y luego levanta el servidor en modo watch.
CMD ["sh", "-c", "npm run migration:run && npm run start:dev"]
