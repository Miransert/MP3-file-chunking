# Media Streaming Backend

## HTTP Endpoints
HTTP currently has a basic implementation with two endpoints.

GET /songs/{id} which returns a song of a specific ID as a stream

POST /songs which prepares a song for streaming by preprocessing and chunking it. (For media acquisition). This takes a body with an id, which should be the song id as known in the application and a file which is the song.

## Socket.IO Server
This server uses the socket.io version 4 library to facilitate data transfer.

Documentation on how to connect to a socket.io server via the client library can be found here https://socket.io/docs/v4/client-api/

## Supported events

### ping

Used to ping the socket server, ensuring connection

## Planned events

### play

Starts streaming audio chunks to the client upon receiving the play payload with an id. Will be expanded with more features in the future.

**Payload**

```typecript
{
  id: string
}
```