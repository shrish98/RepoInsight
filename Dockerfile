# Stage 1: Build the frontend (Vite React app)
FROM node:20-alpine AS client-builder
WORKDIR /client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Serve the backend and static assets
FROM node:20-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm install --legacy-peer-deps --only=production
COPY server/ ./
# Copy the compiled client assets to the /public directory which index.js expects
# (since WORKDIR is /app, ../public resolves to /public)
COPY --from=client-builder /client/dist /public

EXPOSE 5000
CMD ["node", "index.js"]
