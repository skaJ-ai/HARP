FROM node:20-slim AS base
ARG HTTP_PROXY
ARG HTTPS_PROXY
ARG NPM_PROXY
ARG NO_PROXY
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ENV http_proxy=${HTTP_PROXY}
ENV https_proxy=${HTTPS_PROXY}
ENV HTTP_PROXY=${HTTP_PROXY}
ENV HTTPS_PROXY=${HTTPS_PROXY}
ENV no_proxy=${NO_PROXY}
ENV NO_PROXY=${NO_PROXY}
ENV NPM_CONFIG_PROXY=${NPM_PROXY}
ENV NPM_CONFIG_HTTP_PROXY=${NPM_PROXY}
ENV NPM_CONFIG_HTTPS_PROXY=${NPM_PROXY}

FROM base AS deps
COPY .harness/hooks ./.harness/hooks
COPY package.json package-lock.json ./
RUN if [ -n "$NPM_PROXY" ]; then npm config set proxy "$NPM_PROXY" && npm config set https-proxy "$NPM_PROXY"; fi \
 && npm config set strict-ssl false \
 && npm ci --prefer-offline

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production

RUN groupadd --system nodejs
RUN useradd --system --gid nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
