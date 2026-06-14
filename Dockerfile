# Stage 1: Build & Dependencies
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package configuration
COPY package*.json ./

# Install all dependencies (needed for any potential builds/checks)
RUN npm ci

# Stage 2: Production Release
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package configuration
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy application source code
COPY src ./src

# Ensure the app runs under a non-privileged user
USER node

# Expose backend port
EXPOSE 3000

# Health check configuration using wget (built-in in Alpine)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/v1/healthcheck || exit 1

# Start the application
CMD ["node", "src/index.js"]