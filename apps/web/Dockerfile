FROM node:24-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/api/package.json apps/api/package.json
COPY infra/cdk/package.json infra/cdk/package.json
RUN npm ci --workspace=@s3/web --include-workspace-root

FROM deps AS build
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_AUTH_MODE=cognito
ARG NEXT_PUBLIC_COGNITO_AUTHORITY
ARG NEXT_PUBLIC_COGNITO_CLIENT_ID
ARG NEXT_PUBLIC_COGNITO_REDIRECT_URI
ARG NEXT_PUBLIC_COGNITO_LOGOUT_URI
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL NEXT_PUBLIC_AUTH_MODE=$NEXT_PUBLIC_AUTH_MODE NEXT_PUBLIC_COGNITO_AUTHORITY=$NEXT_PUBLIC_COGNITO_AUTHORITY NEXT_PUBLIC_COGNITO_CLIENT_ID=$NEXT_PUBLIC_COGNITO_CLIENT_ID NEXT_PUBLIC_COGNITO_REDIRECT_URI=$NEXT_PUBLIC_COGNITO_REDIRECT_URI NEXT_PUBLIC_COGNITO_LOGOUT_URI=$NEXT_PUBLIC_COGNITO_LOGOUT_URI
COPY apps/web apps/web
RUN npm run build -w @s3/web

FROM node:24-alpine AS runtime
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /app/apps/web/public ./apps/web/public
USER node
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
