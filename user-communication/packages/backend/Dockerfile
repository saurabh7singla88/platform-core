FROM node:22-alpine AS builder
WORKDIR /app
# Copy root workspace manifest + lock file
COPY package.json package-lock.json* ./
# Copy package manifest so npm ci installs workspace deps
COPY packages/backend/package.json ./packages/backend/
RUN npm ci --workspace=packages/backend
# Copy source
COPY packages/backend/tsconfig.json ./packages/backend/
COPY packages/backend/src ./packages/backend/src
WORKDIR /app/packages/backend
RUN npx tsc -p tsconfig.json

FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
COPY packages/backend/package.json ./packages/backend/
RUN npm ci --workspace=packages/backend --omit=dev
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist
COPY packages/backend/migrations ./packages/backend/migrations
WORKDIR /app/packages/backend
EXPOSE 8080
CMD ["node", "dist/index.js"]
