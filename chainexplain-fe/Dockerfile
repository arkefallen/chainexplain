# ==========================================
# STAGE 1: Build the Vite Application
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency contracts first for optimized caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy full frontend codebase (respecting .dockerignore)
COPY . .

# Declare Build Arguments for Vite compile time baking
ARG VITE_API_URL=http://localhost:5000
ARG VITE_FIREBASE_API_KEY=mock-api-key-value-for-local-dev
ARG VITE_FIREBASE_AUTH_DOMAIN=
ARG VITE_FIREBASE_PROJECT_ID=
ARG VITE_FIREBASE_STORAGE_BUCKET=
ARG VITE_FIREBASE_MESSAGING_SENDER_ID=
ARG VITE_FIREBASE_APP_ID=

# Convert build arguments into environment variables for Vite
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ENV VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID
ENV VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID

# Build static bundle inside /app/dist
RUN npm run build

# ==========================================
# STAGE 2: Serve using Nginx Web Server
# ==========================================
FROM nginx:stable-alpine

# Copy custom Nginx routing rules (supports React SPA routers)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
