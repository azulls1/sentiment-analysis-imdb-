# ADR-004: Supabase con Fallback a Datos Locales

**Fecha:** 2026-02-01
**Estado:** Accepted

## Contexto

Necesitamos persistencia de datos (secciones del informe, resultados de modelos, estadisticas) pero no queremos que la aplicacion deje de funcionar si Supabase no esta configurado o no esta disponible.

## Decision

`db_service.py` implementa patron dual-data-layer:
1. Si Supabase esta configurado (`sb.is_configured()`), intenta leer de tablas PostgreSQL
2. Si falla o no esta configurado, usa datos locales de `backend/data/*.py`

## Tablas Supabase

- `analisis_sentimi_report_sections`
- `analisis_sentimi_report_metadata`
- `analisis_sentimi_model_results`
- `analisis_sentimi_dataset_stats`
- `analisis_sentimi_sample_reviews`
- `analisis_sentimi_article`

## Variables de Entorno

```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
```

## Consecuencias

### Positivas
- 100% disponibilidad offline
- Script de seed (`scripts/seed_supabase.py`) para poblar DB
- Datos sincronizados cuando hay conexion

### Negativas
- Datos locales pueden quedar desincronizados si solo se actualiza Supabase
