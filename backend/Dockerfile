FROM node:20-alpine

WORKDIR /app

# Install dependencies first (layer cache optimization)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY src/ ./src/

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 5000

CMD ["node", "src/server.js"]
