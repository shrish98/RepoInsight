FROM node:20-alpine
WORKDIR /app

# Install production dependencies for server
COPY server/package*.json ./
RUN npm install --legacy-peer-deps --only=production

# Copy server application code and pre-built production frontend assets
COPY server/ ./
COPY public/ /public

EXPOSE 5000
CMD ["node", "index.js"]
