FROM node:20-alpine AS build
WORKDIR /app

# Ensure pnpm is available via Corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy manifest and lockfile for better cache behavior
COPY package*.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Copy source and run build (requires dev deps in build stage)
COPY . .
RUN pnpm build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup -S app && adduser -S -G app app

# Install only production dependencies
COPY package*.json pnpm-lock.yaml* ./
RUN corepack enable && corepack prepare pnpm@latest --activate && pnpm install --prod --frozen-lockfile

# Copy built artifacts from the build stage
COPY --from=build /app/dist ./dist

USER app
EXPOSE 4000
CMD ["node", "dist/server.js"]
