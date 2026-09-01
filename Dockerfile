# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS client-build
WORKDIR /app/client

COPY client/package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    if [ -f package-lock.json ]; then npm ci; else npm install --no-audit --no-fund; fi

COPY client/ ./
RUN npm run build

FROM node:20-alpine AS server-runtime
WORKDIR /app/server
ENV NODE_ENV=production

COPY server/package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev --no-audit --no-fund; fi

COPY server/ ./
RUN mkdir -p public audios resultados
COPY --from=client-build /app/client/build/ ./public/

EXPOSE 4001
CMD ["node", "server.js"]
