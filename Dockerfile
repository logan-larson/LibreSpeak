# Build stage
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Create a .env file during build with the required env vars
RUN echo "ELEVENLABS_API_KEY=${ELEVENLABS_API_KEY}" > .env
RUN npm run build

# Production stage
FROM node:20-slim
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/build ./build
COPY --from=builder /app/.env ./.env
RUN npm install --production
EXPOSE 3000
CMD ["node", "build"] 