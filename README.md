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

You need to create a file named 'mysql_root_password' under this directory to use this docker-compose file.