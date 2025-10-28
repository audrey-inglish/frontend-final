FROM node:20-alpine AS build
WORKDIR /app

# Ensure pnpm is available via Corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies (copy lockfile if present for better caching)
COPY package*.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY . .
RUN pnpm build

FROM nginx:stable-alpine AS runtime

# Serve the built static files with nginx
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
