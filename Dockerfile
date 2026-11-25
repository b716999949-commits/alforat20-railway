FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json server.mjs worker.mjs ./
COPY public ./public
ENV NODE_ENV=production PORT=8080
EXPOSE 8080
CMD ["node","server.mjs"]
