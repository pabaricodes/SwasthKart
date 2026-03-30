FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --target=/app/deps -r requirements.txt

FROM python:3.12-slim
WORKDIR /app
COPY --from=builder /app/deps /usr/local/lib/python3.12/site-packages/
COPY alembic.ini ./
COPY alembic ./alembic/
COPY src ./src/
EXPOSE 3002
CMD ["sh", "-c", "python -m alembic upgrade head && python -m uvicorn src.main:app --host 0.0.0.0 --port 3002"]
