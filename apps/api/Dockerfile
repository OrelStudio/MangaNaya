# ----------------------
# Stage 1: Builder
# ----------------------
  FROM oven/bun:1 AS builder
  WORKDIR /app
  
  COPY package.json bun.lockb* ./
  COPY packages ./packages
  RUN bun install
  
  COPY turbo.json .
  COPY apps/api/package.json ./apps/api/package.json
  WORKDIR /app/apps/api
  RUN bun install
  COPY apps/api /app/apps/api/
  RUN bunx tsup index.ts --out-dir=dist --minify --dts --format=esm --clean
  
  # ----------------------
  # Stage 2: Runtime
  # ----------------------
  FROM oven/bun:1 AS runtime
  RUN addgroup --system --gid 1001 nodejs && \
      adduser --system --uid 1001 nextjs
  
  USER nextjs
  WORKDIR /app
  # ENV NODE_ENV=production
  ARG NODE_ENV
  ENV NODE_ENV=${NODE_ENV}

  ARG AWS_ACCESS_KEY_ID
  ARG AWS_SECRET_ACCESS_KEY

  ENV AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
  ENV AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
  
  # 1) Copy the built files
  COPY --from=builder /app/apps/api/dist ./dist
  
  # 2) Copy node_modules
  COPY --from=builder /app/node_modules ./node_modules
  
  # 3) IMPORTANT: Copy the local packages so symlinks aren't broken
  COPY --from=builder /app/packages ./packages
  
  EXPOSE 3000
  CMD ["bun", "run", "./dist/index.js"]
  