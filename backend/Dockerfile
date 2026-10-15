FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && npm ci --omit=dev \
  && apt-get purge -y python3 make g++ \
  && apt-get autoremove -y \
  && rm -rf /var/lib/apt/lists/*

COPY src ./src

RUN mkdir -p /app/data \
  && chown -R node:node /app

USER node
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "src/index.js"]
