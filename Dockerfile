# Stage 1: Builder
FROM alpine:latest AS builder

WORKDIR /app
COPY package.json package-lock.json ./

# Install npm and build dependencies (if any)
RUN apk add --no-cache nodejs npm \
    && npm ci --only=production

# Stage 2: Runtime
FROM alpine:latest

ENV NODE_ENV=production \
    NODE_NO_WARNINGS=1

WORKDIR /app

# Install only runtime dependencies (nodejs)
RUN apk add --no-cache nodejs

# Copy dependencies and app source from builder
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Run as non-root user for security (optional but recommended)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Healthcheck to monitor container status
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["node", "app.js"]

EXPOSE 3000
