# Media Streaming Backend

API URL is http://lamini1.uvm.sdu.dk:30052

## Endpoints

HTTP currently has a basic implementation with two endpoints.

### Ping

`GET /ping`
Returns pong with the HTTP code 200.

Possible return values:

- `200: OK` Server is up and running.

### Song

`GET /songs/{id}`

Returns a song of a specific id as a HTTP stream.

Possible return values:

- `200: OK` Song found successfully and has begun streaming.
- `400: Bad Request` Validation of id failed.
- `404: Not Found` Song of id couldn't be found.

`POST /songs`

Creates a song file in the database and prepares it in chunks for streaming.

**Required encoding:**
multipart/formdata

**Request body:**

```
{
  "id": string,
  "file": buffer
}
```

Possible return values:

- `202: Created` Song found successfully and has begun streaming.
- `400: Bad Request` Validation of body failed.
- `404: Not Found` Song of id couldn't be found.

## Socket Events

`ping`

Takes no payload. Simply returns the message 'pong'. Used to test successful connection.

`play`

Starts streaming audio chunks to the client upon receiving the play payload with an id. Will be expanded with more features in the future.

**Payload:**

```
{
  "id": string
}
```

## Planned Features

### Playback Control

Currently, control on how playback is performed is very limited. A planned feature is being able to specify a certain point from where streaming should be performed.

---

Need something implemented? Send an email to our team leader at magla21@student.sdu.dk
