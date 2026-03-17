-- =============================================================
-- Tablas para el proyecto de Análisis de Sentimientos
-- Prefijo: analisis_sentimi_
-- Ejecutar en PostgreSQL de Supabase
-- =============================================================

-- Secciones del informe
CREATE TABLE IF NOT EXISTS analisis_sentimi_report_sections (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  titulo TEXT NOT NULL,
  contenido TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Resultados de modelos
CREATE TABLE IF NOT EXISTS analisis_sentimi_model_results (
  id SERIAL PRIMARY KEY,
  model_key TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  nombre_corto TEXT,
  accuracy FLOAT,
  precision_macro FLOAT,
  recall_macro FLOAT,
  f1_macro FLOAT,
  tiempo_entrenamiento FLOAT,
  confusion_matrix JSONB,
  classification_report TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Estadísticas del dataset
CREATE TABLE IF NOT EXISTS analisis_sentimi_dataset_stats (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Reseñas de muestra
CREATE TABLE IF NOT EXISTS analisis_sentimi_sample_reviews (
  id SERIAL PRIMARY KEY,
  texto TEXT NOT NULL,
  sentimiento TEXT NOT NULL,
  confianza FLOAT,
  prediccion_nb TEXT,
  prediccion_lr TEXT,
  prediccion_svm TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Datos del artículo de referencia
CREATE TABLE IF NOT EXISTS analisis_sentimi_article (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Metadatos del informe
CREATE TABLE IF NOT EXISTS analisis_sentimi_report_metadata (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================
-- Row Level Security (RLS) + Policies para lectura anónima
-- =============================================================

ALTER TABLE analisis_sentimi_report_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_report_sections" ON analisis_sentimi_report_sections FOR SELECT USING (true);

ALTER TABLE analisis_sentimi_model_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_model_results" ON analisis_sentimi_model_results FOR SELECT USING (true);

ALTER TABLE analisis_sentimi_dataset_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_dataset_stats" ON analisis_sentimi_dataset_stats FOR SELECT USING (true);

ALTER TABLE analisis_sentimi_sample_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_sample_reviews" ON analisis_sentimi_sample_reviews FOR SELECT USING (true);

ALTER TABLE analisis_sentimi_article ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_article" ON analisis_sentimi_article FOR SELECT USING (true);

ALTER TABLE analisis_sentimi_report_metadata ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_report_metadata" ON analisis_sentimi_report_metadata FOR SELECT USING (true);

-- Policies para escritura con service_role
CREATE POLICY "service_write_report_sections" ON analisis_sentimi_report_sections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_write_model_results" ON analisis_sentimi_model_results FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_write_dataset_stats" ON analisis_sentimi_dataset_stats FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_write_sample_reviews" ON analisis_sentimi_sample_reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_write_article" ON analisis_sentimi_article FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_write_report_metadata" ON analisis_sentimi_report_metadata FOR ALL USING (true) WITH CHECK (true);
