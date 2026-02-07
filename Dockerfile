# Dockerfile for Railway deployment
FROM node:22-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Install dependencies
RUN pnpm install --frozen-lockfile --prod=false

# Copy source code
COPY . .

# Build backend
RUN pnpm run build:backend

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "dist/index.js"]
