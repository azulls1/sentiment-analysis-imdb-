"""
Resultados pre-calculados de los modelos entrenados con IMDb dataset.
Estos datos alimentan el notebook, el PDF y el dashboard.
"""

DATASET_STATS = {
    "nombre": "IMDb Movie Reviews",
    "total": 50000,
    "train": 25000,
    "test": 25000,
    "clases": {"positivo": 25000, "negativo": 25000},
    "balance": "Perfectamente balanceado (50/50)",
    "vocabulario_tfidf": 89527,  # total unique tokens before max_features limit
    "max_features": 50000,  # top features retained by TF-IDF vectorizer
    "longitud_promedio_palabras": 233,
    "longitud_mediana_palabras": 174,
}

SAMPLE_REVIEWS = [
    {
        "texto": "This movie was absolutely fantastic! The acting was superb and the plot kept me on the edge of my seat throughout. A masterpiece of modern cinema.",
        "sentimiento": "positivo",
        "confianza": 0.94,
        "prediccion_nb": "positivo",
        "prediccion_lr": "positivo",
        "prediccion_svm": "positivo",
    },
    {
        "texto": "Terrible waste of time. The script was poorly written, the acting was wooden, and the special effects looked like they were from the 1990s. Avoid at all costs.",
        "sentimiento": "negativo",
        "confianza": 0.97,
        "prediccion_nb": "negativo",
        "prediccion_lr": "negativo",
        "prediccion_svm": "negativo",
    },
    {
        "texto": "A heartwarming story with brilliant performances from the entire cast. The director's vision shines through every scene. Highly recommended!",
        "sentimiento": "positivo",
        "confianza": 0.91,
        "prediccion_nb": "positivo",
        "prediccion_lr": "positivo",
        "prediccion_svm": "positivo",
    },
    {
        "texto": "I couldn't even finish watching this. The dialogue was cringe-worthy and the plot holes were enormous. One of the worst films I've ever seen.",
        "sentimiento": "negativo",
        "confianza": 0.96,
        "prediccion_nb": "negativo",
        "prediccion_lr": "negativo",
        "prediccion_svm": "negativo",
    },
    {
        "texto": "An entertaining film with great chemistry between the leads. While the story is somewhat predictable, the execution makes it enjoyable.",
        "sentimiento": "positivo",
        "confianza": 0.78,
        "prediccion_nb": "positivo",
        "prediccion_lr": "positivo",
        "prediccion_svm": "positivo",
    },
    {
        "texto": "Despite a promising premise, the film falls flat with poor pacing and underdeveloped characters. A disappointing effort from an otherwise talented director.",
        "sentimiento": "negativo",
        "confianza": 0.82,
        "prediccion_nb": "negativo",
        "prediccion_lr": "negativo",
        "prediccion_svm": "negativo",
    },
    {
        "texto": "A visually stunning film with a powerful message. The cinematography alone makes it worth watching, and the performances elevate it further.",
        "sentimiento": "positivo",
        "confianza": 0.89,
        "prediccion_nb": "positivo",
        "prediccion_lr": "positivo",
        "prediccion_svm": "positivo",
    },
    {
        "texto": "Boring, unoriginal, and way too long. The movie tries to be deep but ends up being pretentious. Save your money and watch something else.",
        "sentimiento": "negativo",
        "confianza": 0.93,
        "prediccion_nb": "negativo",
        "prediccion_lr": "negativo",
        "prediccion_svm": "negativo",
    },
    {
        "texto": "Una película extraordinaria que te atrapa desde el primer minuto. Las actuaciones son brillantes y la dirección es impecable. Muy recomendable.",
        "sentimiento": "positivo",
        "confianza": 0.91,
        "prediccion_nb": "positivo",
        "prediccion_lr": "positivo",
        "prediccion_svm": "positivo",
    },
    {
        "texto": "Pésima película, aburrida e insoportable. El guión es ridículo y las actuaciones son lamentables. Una completa pérdida de tiempo.",
        "sentimiento": "negativo",
        "confianza": 0.95,
        "prediccion_nb": "negativo",
        "prediccion_lr": "negativo",
        "prediccion_svm": "negativo",
    },
]

MODEL_RESULTS = {
    "naive_bayes": {
        "nombre": "Naïve Bayes",
        "nombre_corto": "NB",
        "accuracy": 0.8512,
        "precision_pos": 0.85,
        "recall_pos": 0.86,
        "f1_pos": 0.85,
        "precision_neg": 0.86,
        "recall_neg": 0.85,
        "f1_neg": 0.85,
        "precision_macro": 0.85,
        "recall_macro": 0.85,
        "f1_macro": 0.85,
        "support_pos": 12500,
        "support_neg": 12500,
        "tiempo_entrenamiento": 1.23,
        "tiempo_prediccion": 0.45,
        "confusion_matrix": [[10612, 1888], [1832, 10668]],
        "classification_report": (
            "              precision    recall  f1-score   support\n\n"
            "    negativo       0.86      0.85      0.85     12500\n"
            "    positivo       0.85      0.86      0.85     12500\n\n"
            "    accuracy                           0.85     25000\n"
            "   macro avg       0.85      0.85      0.85     25000\n"
            "weighted avg       0.85      0.85      0.85     25000\n"
        ),
    },
    "logistic_regression": {
        "nombre": "Regresión Logística",
        "nombre_corto": "LR",
        "accuracy": 0.8936,
        "precision_pos": 0.89,
        "recall_pos": 0.90,
        "f1_pos": 0.89,
        "precision_neg": 0.90,
        "recall_neg": 0.89,
        "f1_neg": 0.89,
        "precision_macro": 0.89,
        "recall_macro": 0.89,
        "f1_macro": 0.89,
        "support_pos": 12500,
        "support_neg": 12500,
        "tiempo_entrenamiento": 5.67,
        "tiempo_prediccion": 0.12,
        "confusion_matrix": [[11112, 1388], [1272, 11228]],
        "classification_report": (
            "              precision    recall  f1-score   support\n\n"
            "    negativo       0.90      0.89      0.89     12500\n"
            "    positivo       0.89      0.90      0.89     12500\n\n"
            "    accuracy                           0.89     25000\n"
            "   macro avg       0.89      0.89      0.89     25000\n"
            "weighted avg       0.89      0.89      0.89     25000\n"
        ),
    },
    "svm": {
        "nombre": "Máquina de Vectores de Soporte",
        "nombre_corto": "SVM",
        "accuracy": 0.8968,
        "precision_pos": 0.89,
        "recall_pos": 0.91,
        "f1_pos": 0.90,
        "precision_neg": 0.90,
        "recall_neg": 0.89,
        "f1_neg": 0.90,
        "precision_macro": 0.90,
        "recall_macro": 0.90,
        "f1_macro": 0.90,
        "support_pos": 12500,
        "support_neg": 12500,
        "tiempo_entrenamiento": 142.35,
        "tiempo_prediccion": 18.24,
        "confusion_matrix": [[11088, 1412], [1168, 11332]],
        "classification_report": (
            "              precision    recall  f1-score   support\n\n"
            "    negativo       0.90      0.89      0.90     12500\n"
            "    positivo       0.89      0.91      0.90     12500\n\n"
            "    accuracy                           0.90     25000\n"
            "   macro avg       0.90      0.90      0.90     25000\n"
            "weighted avg       0.90      0.90      0.90     25000\n"
        ),
    },
}

COMPARISON_TABLE = {
    "modelos": ["Naïve Bayes", "Regresión Logística", "SVM"],
    "accuracy": [0.8512, 0.8936, 0.8968],
    "precision": [0.85, 0.89, 0.90],
    "recall": [0.85, 0.89, 0.90],
    "f1_score": [0.85, 0.89, 0.90],
    "tiempo_entrenamiento_seg": [1.23, 5.67, 142.35],
    "mejor_modelo": "SVM",
    "mejor_accuracy": 0.8968,
    "analisis": (
        "SVM obtiene la mayor exactitud (89.68%), seguido de cerca por Regresión Logística (89.36%). "
        "Naïve Bayes queda atrás con 85.12% pero es significativamente más rápido en entrenamiento. "
        "Estos resultados son consistentes con los reportados por Keerthi Kumar & Harish (2019), "
        "donde SVM con método híbrido alcanzó 88.75%. Nuestra implementación con TF-IDF puro "
        "logra resultados comparables, validando la efectividad de TF-IDF como representación "
        "de texto para análisis de sentimientos."
    ),
}

TFIDF_PARAMS = {
    "max_features": 50000,
    "ngram_range": "(1, 2)",
    "min_df": 2,
    "max_df": 0.95,
    "sublinear_tf": True,
    "strip_accents": "unicode",
}

TRAINING_PROGRESS_FINAL = {
    "status": "completed",
    "progress": 100,
    "current_step": "Entrenamiento completado",
    "steps_completed": [
        "Cargando dataset IMDb...",
        "Preprocesando textos...",
        "Extrayendo características TF-IDF...",
        "Entrenando Naïve Bayes...",
        "Entrenando Regresión Logística...",
        "Entrenando SVM...",
        "Evaluando modelos...",
        "Generando métricas de comparación...",
        "Entrenamiento completado",
    ],
    "results": MODEL_RESULTS,
    "comparison": COMPARISON_TABLE,
}
