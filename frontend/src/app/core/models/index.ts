/** Dataset statistics from the IMDb dataset */
export interface DatasetStats {
  nombre: string;
  total: number;
  train: number;
  test: number;
  clases: { positivo: number; negativo: number };
  balance: string;
  vocabulario_tfidf: number;
  max_features: number;
  longitud_promedio_palabras: number;
  longitud_mediana_palabras: number;
}

/** A sample review with predictions from each model */
export interface SampleReview {
  texto: string;
  sentimiento: string;
  confianza: number;
  prediccion_nb: string;
  prediccion_lr: string;
  prediccion_svm: string;
}

/** Metrics for a single model */
export interface ModelMetrics {
  nombre: string;
  nombre_corto: string;
  accuracy: number;
  precision_pos: number;
  recall_pos: number;
  f1_pos: number;
  precision_neg: number;
  recall_neg: number;
  f1_neg: number;
  precision_macro: number;
  recall_macro: number;
  f1_macro: number;
  support_pos: number;
  support_neg: number;
  tiempo_entrenamiento: number;
  tiempo_prediccion: number;
  confusion_matrix: number[][];
  classification_report: string;
}

/** All model results keyed by model name */
export interface ModelResults {
  naive_bayes: ModelMetrics;
  logistic_regression: ModelMetrics;
  svm: ModelMetrics;
}

/** Model comparison table */
export interface ComparisonTable {
  modelos: string[];
  accuracy: number[];
  precision: number[];
  recall: number[];
  f1_score: number[];
  tiempo_entrenamiento_seg: number[];
  mejor_modelo: string;
  mejor_accuracy: number;
  analisis: string;
}

/** Prediction response from the API */
export interface PredictionResponse {
  texto: string;
  sentimiento: string;
  confianza: number;
  scores: { positivo: number; negativo: number };
  modelo: string;
  idioma: string;
}

/** Training status */
export interface TrainingStatus {
  status: string;
  progress: number;
  current_step: string;
  steps_completed: string[];
}

/** Report section */
export interface ReportSection {
  id: string;
  titulo: string;
  contenido: string;
  sort_order: number;
}

/** Report metadata */
export interface ReportMetadata {
  titulo: string;
  subtitulo: string;
  universidad: string;
  programa: string;
  asignatura: string;
  autor: string;
  fecha: string;
}

/** Report content response */
export interface ReportContent {
  metadata: ReportMetadata;
  blocks: ReportSection[];
}
