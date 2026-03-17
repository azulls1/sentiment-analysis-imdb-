"""
Datos del artículo de referencia:
Keerthi Kumar, H. M., & Harish, B. S. (2019).
Sentiment Analysis on IMDb Movie Reviews Using Hybrid Feature Extraction Method.
International Journal of Interactive Multimedia and Artificial Intelligence, 5(5), 109-114.
"""

ARTICLE_INFO = {
    "titulo": "Análisis de Sentimientos en Reseñas de Películas de IMDb Usando un Método Híbrido de Extracción de Características",
    "titulo_original": "Sentiment Analysis on IMDb Movie Reviews Using Hybrid Feature Extraction Method",
    "autores": [
        {"nombre": "Keerthi Kumar H. M.", "afiliacion": "Departamento de Ingeniería en Ciencias de la Información, Sri Jayachamarajendra College of Engineering, Mysuru, India"},
        {"nombre": "Harish B. S.", "afiliacion": "Departamento de Ingeniería en Ciencias de la Información, Sri Jayachamarajendra College of Engineering, Mysuru, India"},
    ],
    "revista": "International Journal of Interactive Multimedia and Artificial Intelligence (IJIMAI)",
    "volumen": "5",
    "numero": "5",
    "paginas": "109-114",
    "anio": 2019,
    "doi": "10.9781/ijimai.2018.12.005",
    "issn": "1989-1660",
    "abstract": (
        "Con el rápido crecimiento de Internet, las personas tienden a expresar sus opiniones y sentimientos "
        "sobre productos y servicios en redes sociales como blogs, reseñas, Twitter y otras plataformas. "
        "El análisis de sentimientos es el proceso de determinar la actitud u opinión del escritor. "
        "Consiste en clasificar opiniones en texto en categorías como positivo o negativo. "
        "Las reseñas de películas son uno de los dominios más comunes para el análisis de sentimientos. "
        "En este artículo, se propone un método híbrido de extracción de características basado en "
        "Bag of Words (BoW) y Term Frequency-Inverse Document Frequency (TF-IDF) para la clasificación "
        "de sentimientos en reseñas de películas de IMDb. Los resultados experimentales muestran que el método "
        "híbrido de extracción de características con el clasificador de Máquina de Vectores de Soporte (SVM) "
        "alcanza una precisión del 88.75%."
    ),
    "keywords": [
        "Análisis de Sentimientos", "Extracción de Características", "Bag of Words",
        "TF-IDF", "Aprendizaje Automático", "Reseñas de Películas de IMDb"
    ],
    "dataset": {
        "nombre": "IMDb Movie Reviews (Maas et al., 2011)",
        "total_reviews": 50000,
        "train_reviews": 25000,
        "test_reviews": 25000,
        "positivas": 25000,
        "negativas": 25000,
        "balance": "Perfectamente balanceado (50% positivo, 50% negativo)",
        "tipo_tarea": "Clasificación binaria de sentimientos",
        "idioma": "Inglés",
        "dominio": "Reseñas de películas",
        "fuente": "https://ai.stanford.edu/~amaas/data/sentiment/",
        "descripcion": (
            "El dataset Large Movie Review de IMDb (Maas et al., 2011) es uno de los benchmarks "
            "más utilizados en análisis de sentimientos. Contiene 50,000 reseñas de películas "
            "altamente polarizadas, divididas equitativamente en conjuntos de entrenamiento y prueba. "
            "Las reseñas con puntuación ≤4 se etiquetan como negativas y las de ≥7 como positivas, "
            "descartando las neutrales (5-6) para evitar ambigüedad."
        ),
        "referencia_dataset": "Maas, A. L., Daly, R. E., Pham, P. T., Huang, D., Ng, A. Y., & Potts, C. (2011). Learning Word Vectors for Sentiment Analysis. ACL.",
    },
    "objetivo_detallado": {
        "principal": (
            "Proponer un método híbrido de extracción de características basado en Bag of Words (BoW) "
            "y TF-IDF para la clasificación de sentimientos en reseñas de películas de IMDb, "
            "evaluando su rendimiento con clasificadores Naïve Bayes, Regresión Logística y SVM."
        ),
        "especificos": [
            "Implementar y comparar tres métodos de extracción de características: BoW, TF-IDF y un método híbrido que combine ambos.",
            "Evaluar el rendimiento de tres clasificadores de aprendizaje automático (NB, LR, SVM) con cada método de extracción.",
            "Demostrar que la combinación híbrida de BoW y TF-IDF captura información complementaria que mejora la clasificación.",
            "Comparar los resultados obtenidos con trabajos previos en el mismo dataset de IMDb.",
        ],
        "hipotesis": (
            "La combinación de BoW (que captura la presencia de palabras) con TF-IDF (que captura "
            "la importancia relativa de cada término) proporciona una representación más rica del texto "
            "que cualquiera de los dos métodos por separado, mejorando así la precisión de la clasificación."
        ),
    },
    "metodologia": {
        "preprocesamiento": [
            {"paso": "Eliminación de etiquetas HTML", "descripcion": "Remoción de todas las etiquetas HTML presentes en las reseñas crudas de IMDb."},
            {"paso": "Conversión a minúsculas", "descripcion": "Normalización del texto para tratar 'Movie' y 'movie' como el mismo token."},
            {"paso": "Eliminación de signos de puntuación", "descripcion": "Remoción de caracteres no alfanuméricos que no aportan información semántica."},
            {"paso": "Eliminación de stop words", "descripcion": "Filtrado de palabras funcionales de alta frecuencia (the, is, a, etc.) que no contribuyen al sentimiento."},
            {"paso": "Stemming (Porter Stemmer)", "descripcion": "Reducción de palabras a su raíz morfológica (e.g., 'running' → 'run') para reducir la dimensionalidad."},
        ],
        "extraccion_features": [
            {
                "nombre": "Bag of Words (BoW)",
                "descripcion": "Representa cada documento como un vector de frecuencia de palabras. Captura la presencia y frecuencia de cada término, pero ignora su importancia relativa en el corpus.",
                "ventaja": "Simple e intuitivo, captura frecuencia local",
                "limitacion": "No distingue palabras comunes de palabras discriminativas",
            },
            {
                "nombre": "TF-IDF",
                "descripcion": "Pondera cada término por su frecuencia en el documento (TF) e inversamente por su frecuencia en el corpus (IDF). Resalta palabras que son importantes para un documento específico.",
                "ventaja": "Reduce el peso de palabras muy comunes, resalta términos discriminativos",
                "limitacion": "Pierde información de frecuencia absoluta",
                "formula": "TF-IDF(t,d) = TF(t,d) × log(N / DF(t))",
            },
            {
                "nombre": "Método Híbrido (BoW + TF-IDF)",
                "descripcion": "Concatena los vectores de BoW y TF-IDF para cada documento, creando una representación que combina la frecuencia absoluta con la importancia relativa de cada término.",
                "ventaja": "Captura información complementaria de ambos métodos",
                "limitacion": "Mayor dimensionalidad del espacio de características",
            },
        ],
        "clasificadores": [
            {
                "nombre": "Naïve Bayes (NB)",
                "descripcion": "Clasificador probabilístico basado en el teorema de Bayes con la suposición de independencia condicional entre características.",
                "ventaja": "Rápido, eficiente con datos de alta dimensionalidad",
                "limitacion": "La suposición de independencia rara vez se cumple en texto real",
            },
            {
                "nombre": "Regresión Logística (LR)",
                "descripcion": "Modelo lineal que estima la probabilidad de pertenencia a cada clase mediante la función sigmoide. Optimiza los pesos mediante máxima verosimilitud.",
                "ventaja": "Buena interpretabilidad, maneja bien espacios de alta dimensión",
                "limitacion": "Asume relación lineal entre características y la variable objetivo",
            },
            {
                "nombre": "Máquina de Vectores de Soporte (SVM)",
                "descripcion": "Encuentra el hiperplano óptimo que maximiza el margen entre clases. Utiliza funciones kernel para manejar datos no linealmente separables.",
                "ventaja": "Excelente en espacios de alta dimensión, robusto ante overfitting",
                "limitacion": "Mayor costo computacional, especialmente en entrenamiento",
            },
        ],
        "evaluacion": {
            "metrica_principal": "Accuracy (Exactitud)",
            "otras_metricas": ["Precisión", "Recall", "F1-Score"],
            "validacion": "Partición estándar del dataset (25,000 train / 25,000 test)",
            "descripcion": "Se evalúa cada combinación de método de extracción × clasificador (9 combinaciones en total) sobre el conjunto de prueba.",
        },
    },
    "resultados": {
        "BoW": {"NB": 84.00, "LR": 87.25, "SVM": 87.50},
        "TF-IDF": {"NB": 84.25, "LR": 88.00, "SVM": 88.25},
        "Hibrido": {"NB": 84.50, "LR": 88.50, "SVM": 88.75},
    },
    "analisis_resultados": {
        "mejora_hibrido_vs_bow": {
            "NB": "+0.50 pp",
            "LR": "+1.25 pp",
            "SVM": "+1.25 pp",
            "promedio": "+1.00 pp",
        },
        "mejora_hibrido_vs_tfidf": {
            "NB": "+0.25 pp",
            "LR": "+0.50 pp",
            "SVM": "+0.50 pp",
            "promedio": "+0.42 pp",
        },
        "ranking_clasificadores": [
            {"posicion": 1, "clasificador": "SVM", "mejor_accuracy": 88.75, "metodo": "Híbrido", "razon": "Maximiza el margen de separación en espacios de alta dimensionalidad, ideal para la representación híbrida expandida."},
            {"posicion": 2, "clasificador": "Regresión Logística", "mejor_accuracy": 88.50, "metodo": "Híbrido", "razon": "Solo 0.25 pp por debajo de SVM, con menor costo computacional. Relación rendimiento/eficiencia excelente."},
            {"posicion": 3, "clasificador": "Naïve Bayes", "mejor_accuracy": 84.50, "metodo": "Híbrido", "razon": "La suposición de independencia condicional limita su capacidad con features correlacionadas del método híbrido."},
        ],
        "hallazgos_clave": [
            "El método híbrido mejora TODOS los clasificadores sin excepción, confirmando la complementariedad de BoW y TF-IDF.",
            "TF-IDF supera a BoW en todos los casos, lo que indica que la ponderación por importancia relativa es más discriminativa que la frecuencia bruta.",
            "La brecha entre NB y los otros clasificadores (~4 pp) sugiere que la independencia condicional es una suposición demasiado fuerte para este dominio.",
            "SVM y LR tienen resultados muy cercanos (~0.25-0.50 pp), lo que indica que un hiperplano lineal ya captura bien la separación en este espacio de features.",
        ],
        "comparacion_trabajos_previos": [
            {"autores": "Tripathy et al. (2016)", "metodo": "N-grams + SVM", "accuracy": 88.06, "nota": "El método híbrido de Keerthi Kumar supera este resultado en +0.69 pp."},
            {"autores": "Dey et al. (2016)", "metodo": "BoW + SVM", "accuracy": 87.50, "nota": "Idéntico al BoW+SVM del artículo, pero el híbrido lo supera en +1.25 pp."},
            {"autores": "Maas et al. (2011)", "metodo": "BoW baselines", "accuracy": 87.80, "nota": "Autores originales del dataset. El método híbrido mejora su baseline en +0.95 pp."},
        ],
    },
    "conclusiones": [
        "El método híbrido de extracción de características supera consistentemente a BoW y TF-IDF individuales en los tres clasificadores evaluados, validando la hipótesis de complementariedad.",
        "SVM con el método híbrido logra la mayor precisión (88.75%), superando los resultados de trabajos previos como Tripathy et al. (2016) con 88.06% y Dey et al. (2016) con 87.50%.",
        "La combinación de BoW (frecuencia local) y TF-IDF (importancia global) captura información ortogonal: qué tan frecuente es un término en el documento Y qué tan discriminativo es en el corpus.",
        "Regresión Logística obtiene resultados competitivos (88.50%) con menor costo computacional, siendo una alternativa práctica cuando los recursos de entrenamiento son limitados.",
        "Naïve Bayes muestra el rendimiento más bajo (~84%) debido a que su suposición de independencia condicional no se sostiene bien con las features correlacionadas del método híbrido.",
    ],
    "limitaciones": [
        "El estudio se limita a clasificación binaria (positivo/negativo); no aborda sentimientos neutros ni escalas multiclase.",
        "Solo evalúa clasificadores de aprendizaje automático tradicional; no compara con métodos de deep learning (LSTM, BERT) que dominan los benchmarks actuales.",
        "El preprocesamiento usa stemming (Porter Stemmer) en lugar de lematización, lo cual puede perder matices semánticos.",
        "No se reportan métricas adicionales como Precision, Recall y F1-Score por clase, solo accuracy global.",
        "La dimensionalidad del espacio híbrido (BoW + TF-IDF concatenados) no se analiza en términos de costo de memoria y tiempo de inferencia.",
    ],
    "trabajo_futuro": [
        "Explorar métodos de reducción de dimensionalidad (PCA, SVD) sobre el espacio híbrido para mejorar eficiencia sin sacrificar precisión.",
        "Comparar con embeddings densos (Word2Vec, GloVe, FastText) y modelos transformer (BERT, RoBERTa) en el mismo dataset.",
        "Extender el análisis a clasificación multiclase (ratings 1-10) y análisis de aspecto.",
        "Evaluar la transferibilidad del método híbrido a otros dominios (reseñas de productos, tweets, noticias).",
    ],
}

ARTICLE_SUMMARY = {
    "titulo": ARTICLE_INFO["titulo"],
    "titulo_original": ARTICLE_INFO["titulo_original"],
    "autores": ", ".join([a["nombre"] for a in ARTICLE_INFO["autores"]]),
    "anio": ARTICLE_INFO["anio"],
    "revista": ARTICLE_INFO["revista"],
    "doi": ARTICLE_INFO["doi"],
    "abstract": ARTICLE_INFO["abstract"],
    "keywords": ARTICLE_INFO["keywords"],
    "objetivo": ARTICLE_INFO["objetivo_detallado"],
    "dataset": ARTICLE_INFO["dataset"],
    "metodologia": ARTICLE_INFO["metodologia"],
    "resultados_clave": ARTICLE_INFO["resultados"],
    "analisis_resultados": ARTICLE_INFO["analisis_resultados"],
    "mejor_resultado": {
        "metodo": "Híbrido (BoW + TF-IDF)",
        "clasificador": "SVM",
        "accuracy": 88.75,
    },
    "conclusiones": ARTICLE_INFO["conclusiones"],
    "limitaciones": ARTICLE_INFO["limitaciones"],
    "trabajo_futuro": ARTICLE_INFO["trabajo_futuro"],
    "referencia_apa": (
        "Keerthi Kumar, H. M., & Harish, B. S. (2019). Sentiment Analysis on IMDb Movie Reviews "
        "Using Hybrid Feature Extraction Method. International Journal of Interactive Multimedia "
        "and Artificial Intelligence, 5(5), 109-114. https://doi.org/10.9781/ijimai.2018.12.005"
    ),
    "cita_info": {
        "para_que": "Usa esta cita en la bibliografía de tus entregables e informe de la Actividad 2.",
        "formato": "APA 7ma edición",
    },
}
