# Media Streaming Backend

# Docker

## Building image

```
docker build -t gitlab.sdu.dk:5050/semester-project-e2022/team-7-media-streaming/media-streaming-backend:latest .
```

## Pushing image to repo

```
docker push gitlab.sdu.dk:5050/semester-project-e2022/team-7-media-streaming/media-streaming-backend:latest   
```
# Using the streaming service

## Connecting to the server

The server uses the socket.io version 4 library to facilitate data transfer.

Documentation on how to connect to a socket.io server via the client library can be found here https://socket.io/docs/v4/client-api/

## Supported events

### ping

Used to ping the socket server, ensuring connection

## Planned events

### play

Payload

```json
{}
```

### stop

Payload

```json
{}
```
