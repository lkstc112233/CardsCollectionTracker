# CardsCollectionTracker
 A collection tracker.

## Build

```
$ docker build -f .\CollectionServer\Dockerfile .
$ docker build -f .\CollectionWebApp\Dockerfile .
```

## Run

```
$ docker-compose up
```

You may still need to modify docker-compose.yml, and add a custom image tag when building the image.