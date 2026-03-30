FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir opentelemetry-distro opentelemetry-exporter-otlp
RUN opentelemetry-bootstrap -a install

COPY app.py ./

ENV PYTHONUNBUFFERED=1
ENV ERROR_RATE=0.25
ENV OTEL_SERVICE_NAME=my-cloudrun-service
ENV OTEL_RESOURCE_ATTRIBUTES=deployment.environment=prod,service.version=1.0.0
ENV OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4317
ENV OTEL_EXPORTER_OTLP_PROTOCOL=grpc
ENV OTEL_TRACES_EXPORTER=otlp
ENV OTEL_METRICS_EXPORTER=otlp
ENV OTEL_LOGS_EXPORTER=otlp

EXPOSE 8080

CMD ["opentelemetry-instrument", "python", "app.py"]
