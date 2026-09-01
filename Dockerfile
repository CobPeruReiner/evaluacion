# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS client-build
WORKDIR /app/client

COPY client/package.json client/package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

COPY client/ ./
RUN npm run build

FROM node:20-alpine AS server-runtime
WORKDIR /app/server
ENV NODE_ENV=production

COPY server/package.json server/package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

COPY server/ ./
RUN mkdir -p public audios resultados
COPY --from=client-build /app/client/build/ ./public/

EXPOSE 4001
CMD ["node", "server.js"]
