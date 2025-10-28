FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN pnpm install --prod
COPY . .
RUN pnpm build
EXPOSE 4000
CMD ["node", "dist/index.js"]
