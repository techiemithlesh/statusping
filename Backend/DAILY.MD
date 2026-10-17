# Day 01: Why `php artisan serve` Fails on Scale? - A Practical Breakdown

> Hook: मैंने सोचा Laravel API तो बन गई, बस deploy कर दूंगा। फिर मैंने 100 users का load मारा और मेरा CPU 100% पर मर गया।

### 1. What We Tried to Do?
Goal था Ankit Bhai की तरह High Level System Design को practically test करना।

Plan:
1. Without Docker -> Load Test
2. With Docker -> Load Test  
3. 3 Systems Connect -> Cluster Load Test

### 2. Phase 1: Without Docker (The Reality Check)

**Setup:** `php artisan serve --host=0.0.0.0 --port=8000`
**Tool:** Grafana k6 - `k6 run --vus 100 --duration 10s`

**Result - The Shock:**