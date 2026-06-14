# Stage 1: Build static assets
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Declare build arguments for Vite environment variables
ARG VITE_API_URL
ARG VITE_SITE_URL

# Expose them to the build environment
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SITE_URL=$VITE_SITE_URL

# Build the application
RUN npm run build

# Stage 2: Serve static assets with Nginx
FROM nginx:1.25-alpine

# Copy custom Nginx configuration template for environment variable substitution
COPY default.conf.template /etc/nginx/templates/default.conf.template

# Copy build output from Stage 1 to Nginx HTML folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
