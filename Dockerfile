# Stage 1: Build the application
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files and install all dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application source code
COPY . .

RUN npm rebuild esbuild
# Build the frontend and backend
# The build script in package.json handles both vite and esbuild
RUN npm run build

# Prune development dependencies for the final image
RUN npm prune --omit=dev && npm install vite esbuild --omit=optional

# Stage 2: Create the production image
FROM node:20-slim AS runner

WORKDIR /app

# Copy pruned dependencies from the builder stage
COPY --from=builder app/node_modules ./node_modules
COPY --from=builder app/package.json ./package.json
COPY --from=builder app/package-lock.json ./package-lock.json
RUN npm install vite esbuild

# Copy the built application from the builder stage
COPY --from=builder /app/dist ./dist

# The application runs on port 5000 by default, as specified in server/index.ts
# and required by the environment.
EXPOSE 5000

# The start script in package.json runs the production server
CMD ["npm", "start"]