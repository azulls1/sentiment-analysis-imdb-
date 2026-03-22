# Post-Mortem Report

## Incident Summary

| Field | Value |
|-------|-------|
| **Title** | _[Brief description of the incident]_ |
| **Date** | _YYYY-MM-DD_ |
| **Duration** | _[Total time from detection to resolution]_ |
| **Severity** | _P1 / P2 / P3 / P4_ |
| **Author** | _[Name of the post-mortem author]_ |
| **Status** | _Draft / In Review / Final_ |

---

## Timeline

All times in UTC (or local timezone with offset).

| Time | Event |
|------|-------|
| _HH:MM_ | _[First sign of the issue — alert triggered, user report, etc.]_ |
| _HH:MM_ | _[Issue acknowledged by on-call engineer]_ |
| _HH:MM_ | _[Investigation started — initial diagnosis]_ |
| _HH:MM_ | _[Root cause identified]_ |
| _HH:MM_ | _[Fix applied / mitigation deployed]_ |
| _HH:MM_ | _[Service confirmed restored]_ |
| _HH:MM_ | _[Monitoring confirmed stable]_ |

---

## Root Cause Analysis

### What happened?

_[Describe the technical root cause. Be specific about what component failed and why.]_

### Why did it happen?

_[Describe the underlying reasons. Use the "5 Whys" technique if helpful.]_

1. Why? _[First-level cause]_
2. Why? _[Second-level cause]_
3. Why? _[Third-level cause]_
4. Why? _[Fourth-level cause]_
5. Why? _[Root cause]_

### Contributing factors

- _[Factor 1: e.g., missing monitoring for this specific failure mode]_
- _[Factor 2: e.g., no automated tests covering this scenario]_
- _[Factor 3: e.g., documentation gap]_

---

## Impact Assessment

### User Impact

| Metric | Value |
|--------|-------|
| Users affected | _[Number or percentage]_ |
| Requests failed | _[Count or percentage]_ |
| Duration of impact | _[Minutes/hours]_ |
| Data loss | _[Yes/No — describe if yes]_ |

### Service Impact

| Service | Impact |
|---------|--------|
| Backend API | _[Down / Degraded / Unaffected]_ |
| Frontend | _[Down / Degraded / Unaffected]_ |
| ML Predictions | _[Down / Degraded / Unaffected]_ |
| PDF Export | _[Down / Degraded / Unaffected]_ |
| Monitoring | _[Down / Degraded / Unaffected]_ |

---

## What Went Well

- _[Things that worked correctly during the incident]_
- _[Effective monitoring/alerting that helped detection]_
- _[Good communication or coordination]_

## What Went Poorly

- _[Things that made the incident worse or delayed resolution]_
- _[Missing alerts or documentation]_
- _[Communication gaps]_

## Where We Got Lucky

- _[Things that could have made the incident worse but did not]_
- _[Coincidences that helped resolution]_

---

## Action Items

| Priority | Action | Owner | Deadline | Status |
|----------|--------|-------|----------|--------|
| P1 | _[Critical fix to prevent recurrence]_ | _[Name]_ | _YYYY-MM-DD_ | Open |
| P2 | _[Improve monitoring/alerting]_ | _[Name]_ | _YYYY-MM-DD_ | Open |
| P3 | _[Update documentation/runbook]_ | _[Name]_ | _YYYY-MM-DD_ | Open |
| P3 | _[Add test coverage for this scenario]_ | _[Name]_ | _YYYY-MM-DD_ | Open |

---

## Lessons Learned

1. _[Key takeaway 1]_
2. _[Key takeaway 2]_
3. _[Key takeaway 3]_

---

## Appendix

### Relevant Logs

```
[Paste relevant log snippets here]
```

### Relevant Metrics

_[Include screenshots or metric snapshots from Grafana/Prometheus if available]_

### References

- [Incident Runbook](./incident-runbook.md)
- [Monitoring Configuration](./monitoring.md)
- [Capacity Planning](./capacity-planning.md)
