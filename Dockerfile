# Stage 1: Build the application
FROM node:20-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm rebuild esbuild
RUN npm run build

RUN npm prune --omit=dev

# Stage 2: Production image
FROM node:20-slim AS runner

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/dist ./dist

EXPOSE 5000

CMD ["npm", "start"]