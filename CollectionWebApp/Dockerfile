FROM photoncat/docker-protoc-gen-grpc-web:dev AS proto-compile
COPY ["proto", "./proto/"]
RUN mkdir out
RUN protoc -I=./proto \
    --js_out=import_style=commonjs,binary:out \
    --grpc-web_out=import_style=commonjs,mode=grpcweb:out \
    ./proto/*.proto

FROM node:12-alpine AS webapp-compile
WORKDIR /app
COPY ["CollectionWebApp/package.json", "."]
RUN npm install
COPY ["CollectionWebApp/src", "./src"]
COPY --from=proto-compile ["/protoc/out", "./src"]
RUN npx webpack

FROM node:12-alpine
RUN npm install -g http-server
COPY ["CollectionWebApp/static", "/site"]
COPY --from=webapp-compile /app/dist/ /site
EXPOSE 23333
CMD ["http-server", "-p23333", "/site"]