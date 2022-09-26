FROM photoncat/docker-protoc-gen-grpc-web:dev AS proto-compile
COPY ["proto", "./proto/"]
RUN mkdir out
RUN protoc -I=./proto \
    --js_out=import_style=commonjs,binary:out \
    --grpc-web_out=import_style=commonjs,mode=grpcweb:out \
    ./proto/*.proto

FROM node:12-alpine AS webapp-compile
WORKDIR /app
COPY ["CollectionExtension/package.json", "."]
RUN npm install
COPY ["CollectionExtension/src", "./src"]
COPY --from=proto-compile ["/protoc/out", "./src"]
RUN npx webpack --entry ./src/popup.js

FROM scratch AS export-stage
COPY --from=webapp-compile /app/dist/main.js ./popup.js