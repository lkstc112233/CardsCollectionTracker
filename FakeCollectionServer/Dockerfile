FROM node:18-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY ["FakeCollectionServer/package.json", "FakeCollectionServer/package-lock.json*", "./"]
RUN npm install --production
RUN npm ci --only=production
COPY ["FakeCollectionServer", "./"]
COPY ["proto", "./proto/"]
EXPOSE 33333
CMD ["node", "server.js"]