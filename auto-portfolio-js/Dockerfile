# Build stage
FROM node:18-alpine AS builder

# Install OpenSSL for Prisma compatibility
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

# Install OpenSSL for Prisma compatibility
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files and prisma schema
COPY package*.json ./
COPY --from=builder /app/prisma ./prisma

# Install production dependencies only
RUN npm ci --only=production

# Copy generated Prisma clients from builder stage
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./

# Create data directory for SQLite
RUN mkdir -p /app/data

# Expose port 3000
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the application (auto-sync schema then start next server)
CMD npx prisma db push && npm start



