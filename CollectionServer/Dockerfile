FROM node:18-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY ["CollectionServer/package.json", "CollectionServer/package-lock.json*", "./"]
RUN npm install --production
RUN npm ci --only=production
COPY ["CollectionServer", "./"]
COPY ["proto", "./proto/"]
EXPOSE 33333
CMD ["node", "server.js"]