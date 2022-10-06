# CardsCollectionTracker
 A collection tracker.

## Dockerhub

[Server](https://hub.docker.com/r/photoncat/collection_server)
[WebApp](https://hub.docker.com/r/photoncat/collection_web_app)

## Build

```
$ docker build -f .\CollectionServer\Dockerfile .
$ docker build -f .\CollectionWebApp\Dockerfile .
```

### Mobile App Codegen

```
$ docker build -f .\CollectionMobileApp\Dockerfile --output .\CollectionMobileApp\CollectionMobileApp\genfiles .
```

### Pack Extension

```
$ docker build -f .\CollectionExtension\Dockerfile --output .\CollectionExtension\genfiles .
```

Then pack the extension with genfiles.

## Run

```
$ docker-compose up
```

You may still need to modify docker-compose.yml, and add a custom image tag when building the image.

You need to create a file named 'mysql_root_password' under this directory to use this docker-compose file.

## Roadmap

Features in plan: 

* iOS Application
  * Carry a binder on the go
  * Modify binder locally
  * Sync modification later
* Chrome Extension