# ------------------------------------------------------------ #
# base: 依存の解決とソースのコピー（development / builder の共通土台）
# ------------------------------------------------------------ #
FROM node:22-alpine AS base

RUN apk add --no-cache bash openssl

WORKDIR /app

COPY package.json package-lock.json ./
# postinstall の prisma generate に schema が要る
COPY prisma ./prisma
RUN npm ci

COPY . .

# ------------------------------------------------------------ #
# builder: tsc でビルドし、devDependencies を落とす
# ------------------------------------------------------------ #
FROM base AS builder

RUN npm run transpile
RUN npm prune --omit=dev

# ------------------------------------------------------------ #
# production: 実行に要るものだけ。非 root で動かす
# ------------------------------------------------------------ #
FROM node:22-alpine AS production

RUN apk add --no-cache openssl

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app
ENV NODE_ENV=production

# "type": "module" を dist に効かせるため package.json が要る
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
# migrate deploy をこのイメージから実行できるように schema と migrations も持つ
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma

USER nodejs
EXPOSE 8787

CMD ["node", "dist/node.js"]

# ------------------------------------------------------------ #
# development: ソースをマウントして tsx watch
# ------------------------------------------------------------ #
FROM base AS development

EXPOSE 8787
CMD ["npm", "run", "dev"]
