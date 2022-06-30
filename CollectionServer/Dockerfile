FROM node:18-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production
RUN npm ci --only=production
COPY . .
EXPOSE 33333
CMD ["node", "server.js"]