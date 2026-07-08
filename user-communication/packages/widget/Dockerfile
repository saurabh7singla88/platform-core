FROM node:22-alpine AS builder
WORKDIR /app
# Copy root workspace manifest + lock file
COPY package.json package-lock.json* ./
# Copy package manifest so npm ci installs workspace deps
COPY packages/widget/package.json ./packages/widget/
RUN npm ci --workspace=packages/widget
# Copy source
COPY packages/widget ./packages/widget
WORKDIR /app/packages/widget
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/packages/widget/dist /usr/share/nginx/html
COPY packages/widget/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
