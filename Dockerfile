# Production Dockerfile for Medical AI
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install all dependencies (including devDependencies required for build)
RUN npm ci

# Copy project files
COPY . .

# Build the frontend production assets
RUN npm run build

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
# Install production dependencies + tsx for TypeScript server execution
RUN npm ci --omit=dev && npm install -g tsx

# Copy built assets and server files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/src/server ./src/server
COPY --from=builder /app/src/data ./src/data
COPY --from=builder /app/tsconfig.json ./tsconfig.json

EXPOSE 3000

CMD ["tsx", "server.ts"]
