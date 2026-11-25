FROM node:22-bookworm-slim
WORKDIR /app
COPY alfurat-site.tar.gz /tmp/alfurat-site.tar.gz
RUN tar -xzf /tmp/alfurat-site.tar.gz --no-same-owner -C /app && rm /tmp/alfurat-site.tar.gz && test -f /app/public/index.html && test -f /app/server.mjs
ENV NODE_ENV=production PORT=8080
EXPOSE 8080
CMD ["node","server.mjs"]
