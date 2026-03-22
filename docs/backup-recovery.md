# Backup & Recovery Plan

## Overview

This document defines the backup strategy, recovery procedures, and
availability targets for the IMDb Sentiment Analysis application.

---

## 1. What Is Backed Up

| Asset | Storage | Backup Method |
|-------|---------|---------------|
| **ML models** (`.joblib`) | Docker volume `model-data` | Volume snapshot |
| **Application data** | Supabase (PostgreSQL) | Supabase automated daily backups |
| **Source code** | GitHub | Git history + branch protection |
| **Container images** | GitHub Container Registry / local | CI builds tagged by SHA |

## 2. Backup Schedule

| Asset | Frequency | Retention |
|-------|-----------|-----------|
| ML model volume | Daily at 02:00 UTC | 7 days rolling |
| Supabase database | Daily (Supabase Pro) | 7 days point-in-time |
| Docker images | Every CI build (SHA-tagged) | Latest 30 builds |

## 3. Model Backup Procedure

### Create a volume snapshot

```bash
# Stop the backend container gracefully
docker compose stop backend

# Create a tarball of the model volume
docker run --rm \
  -v model-data:/data \
  -v "$(pwd)/backups":/backup \
  alpine tar czf /backup/models-$(date +%Y%m%d).tar.gz -C /data .

# Restart the backend
docker compose start backend
```

### Automated daily backup (cron)

```bash
# /etc/cron.d/imdb-model-backup
0 2 * * * root docker run --rm \
  -v model-data:/data \
  -v /opt/backups/imdb:/backup \
  alpine tar czf /backup/models-$(date +\%Y\%m\%d).tar.gz -C /data . \
  && find /opt/backups/imdb -name "models-*.tar.gz" -mtime +7 -delete
```

## 4. Database Backup

Supabase provides automated daily backups for Pro-tier projects.

- **Dashboard**: https://supabase.com/dashboard/project/_/settings/backups
- **Point-in-time recovery**: available on Pro plan (up to 7 days)
- **Manual export**: `pg_dump` via the Supabase connection string

```bash
# Manual database export
pg_dump "$SUPABASE_DB_URL" --format=custom -f backup-$(date +%Y%m%d).dump
```

## 5. Recovery Procedures

### 5.1 Recover ML models from volume backup

```bash
# 1. Stop backend
docker compose stop backend

# 2. Restore the volume from tarball
docker run --rm \
  -v model-data:/data \
  -v "$(pwd)/backups":/backup \
  alpine sh -c "rm -rf /data/* && tar xzf /backup/models-YYYYMMDD.tar.gz -C /data"

# 3. Start backend (models reload on startup)
docker compose start backend
```

Estimated time: **< 2 minutes** (volume restore + container restart).

### 5.2 Recover from database backup

1. Navigate to **Supabase Dashboard > Settings > Backups**.
2. Select the desired restore point.
3. Click **Restore** and confirm.
4. Restart the backend to pick up any schema changes:
   ```bash
   docker compose restart backend
   ```

Estimated time: **< 5 minutes** for small datasets.

### 5.3 Rebuild from scratch (disaster recovery)

```bash
# 1. Clone repository
git clone <repo-url> && cd "Actividad 2"

# 2. Restore environment
cp .env.example .env  # fill in secrets

# 3. Retrain models (takes ~3 min)
python -m backend.scripts.train_and_save

# 4. Start services
docker compose up --build -d
```

Estimated time: **< 10 minutes**.

## 6. Recovery Targets

| Metric | Target | Rationale |
|--------|--------|-----------|
| **RTO** (Recovery Time Objective) | 5 minutes | Container restart + model reload from volume |
| **RPO** (Recovery Point Objective) | 24 hours | Daily backup cadence |

## 7. Testing

- **Monthly**: restore a model backup to a staging volume and verify predictions.
- **Quarterly**: perform a full disaster-recovery drill (clone, retrain, deploy).
