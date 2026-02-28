# Dockerfile for Orchestrator Gateway
FROM node:22-alpine

WORKDIR /app

# Install build dependencies for better-sqlite3 and other native modules
RUN apk add --no-cache python3 make g++ 

COPY orchestration/package*.json ./
RUN npm install --production

COPY orchestration/ .

EXPOSE 3323

ENV PORT=3323
ENV NODE_ENV=production

CMD ["node", "index.js"]
