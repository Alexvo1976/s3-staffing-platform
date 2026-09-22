FROM node:24-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY infra/cdk/package.json infra/cdk/package.json
RUN npm ci --workspace=@s3/api --include-workspace-root

FROM deps AS build
COPY apps/api apps/api
RUN npm run build -w @s3/api

FROM node:24-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/prisma ./apps/api/prisma
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
USER node
EXPOSE 4000
CMD ["node", "apps/api/dist/main.js"]
