# Hello World Random Error App (Python)

Simple Flask app:
- `GET /` returns `{"message":"Hello, World!"}` most of the time.
- `GET /` randomly returns `500` with `{"error":"Random error generated"}`.
- `GET /health` always returns `200`.

## Build Docker image

```bash
docker build -t hello-world-random-error:latest .
```

Run this command from `services/hello-world-python`.

## Run container

```bash
docker run --rm -p 8080:8080 -e ERROR_RATE=0.30 hello-world-random-error:latest
```

## Test

```bash
curl -i http://localhost:8080/
curl -i http://localhost:8080/health
```

`ERROR_RATE` accepts values between `0` and `1` (default: `0.25`).
