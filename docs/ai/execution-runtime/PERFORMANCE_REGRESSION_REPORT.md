# Performance Regression Baseline Report

## Comparison Table

| Metric | Baseline Target | Measured Current | Threshold | Result |
| :--- | :--- | :--- | :--- | :--- |
| **Scheduler Dispatch Latency** | < 1.0 ms | **0.18 ms** | < 2.0 ms | PASS |
| **50-Node Scale Execution Time** | < 5000 ms | **12.98 ms** | < 5000 ms | PASS |
| **Checkpoint Restore Time** | < 10 ms | **0.84 ms** | < 20 ms | PASS |
| **Memory Growth (50 Nodes)** | < 10 MB | **< 1.8 MB** | < 50 MB | PASS |
| **E2E Pipeline Execution Duration** | < 100 ms | **8.49 ms** | < 1000 ms | PASS |
