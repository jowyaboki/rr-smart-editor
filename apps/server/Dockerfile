# apps/server/Dockerfile
# Multi-stage production build for RR Smart Editor Server

# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app

# Copy lock files and package files
COPY package.json package-lock.json ./
COPY apps/server/package.json ./apps/server/
COPY packages/shared/package.json ./packages/shared/
COPY packages/api-contracts/package.json ./packages/api-contracts/
COPY packages/public-sdk/package.json ./packages/public-sdk/
COPY packages/security-platform/package.json ./packages/security-platform/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build assets
RUN npm run build --workspace=@ai-video-editor/server --if-present

# Stage 2: Runner
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy necessary runtime assets
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules/
COPY --from=builder /app/apps/server ./apps/server/
COPY --from=builder /app/packages ./packages/

EXPOSE 3001
CMD ["node", "apps/server/src/index.ts"]
