# ── Frontend Production Dockerfile (multi-stage) ─────────────────────────────
#
# Stage 1 (builder): install deps, run `quasar build -m pwa` — NO API URL baked in
# Stage 2 (runner):  nginx serves the PWA; entrypoint writes config.js at
#                    container start from the API_URL env var (runtime, not build-time)

# ── Stage 1: builder ─────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Install Quasar CLI globally
RUN npm install -g @quasar/cli

# Install dependencies — skip postinstall (quasar prepare) because it needs
# source files that aren't copied yet
COPY package*.json ./
RUN npm install --ignore-scripts

# Copy all source files, then run quasar prepare and build
COPY . .

RUN npx quasar prepare && quasar build -m pwa

# ── Stage 2: runner ───────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/app.conf

# Copy built PWA from builder stage
COPY --from=builder /app/dist/pwa /usr/share/nginx/html

# Copy entrypoint script that injects API_URL into config.js at runtime
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
