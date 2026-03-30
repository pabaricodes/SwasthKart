# ADR-003: Self-Hosted Kafka for Event Bus

## Status
Accepted

## Context
Options considered: AWS SNS/SQS (managed) vs self-hosted Kafka in Kubernetes.

## Decision
Use **self-hosted Kafka** deployed as StatefulSets in the EKS cluster.

## Consequences
- Schema Registry support for contract enforcement (Avro schemas)
- Event replay capability for debugging and recovery
- Full control over partitioning, retention, and consumer groups
- Operational overhead: must manage Kafka + Zookeeper lifecycle
- Topics: `payment.succeeded`, `order.placed`, `order.handed-off` (3 partitions, 7-day retention)
