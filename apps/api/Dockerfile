FROM node:24-alpine AS build-deps

WORKDIR /app

COPY package*.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY infra/cdk/package.json infra/cdk/package.json

RUN npm ci --workspace=@s3/api --include-workspace-root

FROM build-deps AS build

COPY apps/api apps/api

RUN npm run build -w @s3/api

FROM node:24-alpine AS production-deps

WORKDIR /app

COPY package*.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/api/prisma apps/api/prisma
COPY apps/web/package.json apps/web/package.json
COPY infra/cdk/package.json infra/cdk/package.json

RUN npm ci --omit=dev --workspace=@s3/api --include-workspace-root \
    && node node_modules/prisma/build/index.js generate --schema apps/api/prisma/schema.prisma

FROM node:24-alpine AS runtime

ENV NODE_ENV=production

WORKDIR /app

# npm may install workspace dependencies below apps/api/node_modules instead of
# hoisting them to the repository root. Both locations are required at runtime.
COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=production-deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/prisma ./apps/api/prisma
COPY --from=build /app/apps/api/scripts ./apps/api/scripts
COPY --from=build /app/apps/api/package.json ./apps/api/package.json

USER node

EXPOSE 4000

CMD ["sh", "-c", "node apps/api/scripts/migrate.mjs && exec node apps/api/dist/main.js"]
