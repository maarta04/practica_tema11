FROM node:22-alpine AS deps
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci
RUN npx prisma generate

RUN npm prune --production


FROM node:22-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodeapp

COPY --from=deps /app/node_modules ./node_modules
COPY --chown=nodeapp:nodejs . .

USER nodeapp

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "src/app.js"]
