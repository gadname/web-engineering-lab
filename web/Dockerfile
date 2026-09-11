# ------------------------------------------------------------ #
# base: 依存の解決
# ------------------------------------------------------------ #
FROM node:22-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ------------------------------------------------------------ #
# builder: next build（standalone 出力）
# NEXT_PUBLIC_* はビルド時に埋め込まれるため、build-arg で渡す
# ------------------------------------------------------------ #
FROM base AS builder
ARG NEXT_PUBLIC_ENV=local
ARG NEXT_PUBLIC_CORE_BACKEND_REST_ENDPOINT=http://localhost:8787
ARG NEXT_PUBLIC_AI_BACKEND_REST_ENDPOINT=http://localhost:8000
ENV NEXT_PUBLIC_ENV=$NEXT_PUBLIC_ENV \
    NEXT_PUBLIC_CORE_BACKEND_REST_ENDPOINT=$NEXT_PUBLIC_CORE_BACKEND_REST_ENDPOINT \
    NEXT_PUBLIC_AI_BACKEND_REST_ENDPOINT=$NEXT_PUBLIC_AI_BACKEND_REST_ENDPOINT \
    NEXT_TELEMETRY_DISABLED=1
COPY . .
RUN npm run build

# ------------------------------------------------------------ #
# production: standalone 出力だけを非 root で動かす
# ------------------------------------------------------------ #
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]

# ------------------------------------------------------------ #
# development: ソースをマウントして next dev
# ------------------------------------------------------------ #
FROM base AS development
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
