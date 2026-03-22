/**
 * Spanish locale strings for the sentiment analysis platform.
 * All user-facing UI text is centralized here to enable i18n.
 */
export const ES_LOCALE = {
  app: {
    title: 'Análisis de Sentimientos',
    subtitle: 'IMDb Movie Reviews',
    fullTitle: 'Análisis de Sentimientos — IMDb',
    description: 'Plataforma de Análisis de Sentimientos en Reseñas de Películas IMDb',
  },
  dashboard: {
    title: 'Dashboard',
    heroTitle: 'Análisis de Sentimientos — IMDb',
    loading: 'Cargando...',
    predict: 'Analizar',
    analyzing: 'Analizando...',
    analyzeSentiment: 'Analizar Sentimiento',
    positive: 'Positiva',
    negative: 'Negativa',
    positives: 'Positivas',
    negatives: 'Negativas',
    enterReview: 'Escribe una reseña para analizar...',
    result: 'Resultado',
    confidence: 'Confianza',
  },
  dataset: {
    title: 'Dataset',
    total: 'Total',
    train: 'Entrenamiento',
    test: 'Prueba',
    positives: 'Positivas',
    negatives: 'Negativas',
    balance: 'Balance',
    vocabulary: 'Vocabulario TF-IDF',
    samples: 'Muestras',
  },
  model: {
    title: 'Modelos',
    naiveBayes: 'Naive Bayes',
    logisticRegression: 'Regresión Logística',
    svm: 'SVM',
    accuracy: 'Precisión',
    confusionMatrix: 'Matriz de Confusión',
    trainingTime: 'Tiempo de Entrenamiento',
    bestModel: 'Mejor Modelo',
    comparison: 'Comparación',
    analysis: 'Análisis',
  },
  article: {
    title: 'Artículo de Referencia',
    summary: 'Resumen',
  },
  report: {
    title: 'Informe Académico',
    metadata: 'Metadatos',
  },
  entregables: {
    title: 'Entregables',
    filesForDownload: 'Archivos para Descargar',
    downloading: 'Descargando...',
    download: 'Descargar',
    downloadZip: 'Descargar ZIP',
    usage: 'Descargar y subir a plataforma UNIR',
  },
  common: {
    retry: 'Reintentar',
    close: 'Cerrar',
    download: 'Descargar',
    positive: 'Positiva',
    negative: 'Negativa',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    save: 'Guardar',
    back: 'Volver',
    next: 'Siguiente',
    previous: 'Anterior',
    search: 'Buscar',
    noData: 'Sin datos disponibles',
    yes: 'Sí',
    no: 'No',
  },
  errors: {
    network: 'No se pudo conectar con el servidor',
    timeout: 'Tiempo de espera agotado',
    rateLimit: 'Demasiadas solicitudes. Por favor, espera un momento.',
    notFound: 'Recurso no encontrado',
    serverError: 'Error interno del servidor',
    unauthorized: 'No autorizado',
    validationError: 'Error de validación',
    unknown: 'Ocurrió un error inesperado',
    retryConnection: 'Reintentar conexión con el servidor',
  },
  nav: {
    dashboard: 'Dashboard',
    dataset: 'Dataset',
    models: 'Modelos',
    article: 'Artículo',
    report: 'Informe',
    entregables: 'Entregables',
    argilla: 'Argilla',
  },
  accessibility: {
    skipToContent: 'Saltar al contenido principal',
    openMenu: 'Abrir menú',
    closeMenu: 'Cerrar menú',
    newTab: 'Se abre en una nueva pestaña',
  },
} as const;

/** Recursively maps all leaf values of T to string */
type DeepStringify<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringify<T[K]>;
};

/**
 * Locale shape type. Uses string for all leaf values so that
 * different locales can provide their own translated strings.
 */
export type LocaleStrings = DeepStringify<typeof ES_LOCALE>;
