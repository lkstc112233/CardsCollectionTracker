FROM photoncat/docker-protoc-gen-grpc-swift:dev AS proto-compile
COPY ["proto", "./proto/"]
RUN mkdir out
RUN protoc -I=./proto \
    --swift_opt=Visibility=Public \
    --swift_out=out \
    --grpc-swift_opt=Visibility=Public,AsyncClient=True,AsyncServer=True \
    --grpc-swift_out=out \
    ./proto/*.proto

FROM scratch AS export-stage
COPY --from=proto-compile /protoc/out .