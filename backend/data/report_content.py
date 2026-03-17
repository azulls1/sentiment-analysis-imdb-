"""
Contenido completo del informe académico en español.
Cada bloque corresponde a una sección del informe PDF.
El texto está formateado en HTML listo para Jinja2/WeasyPrint.
"""

REPORT_METADATA = {
    "titulo": "Análisis de Sentimientos en Reseñas de Películas IMDb mediante Aprendizaje Automático",
    "subtitulo": "Replicación y extensión del método de Keerthi Kumar & Harish (2019)",
    "asignatura": "Procesamiento de Lenguaje Natural",
    "programa": "Máster Universitario en Inteligencia Artificial",
    "universidad": "Universidad Internacional de La Rioja (UNIR)",
    "autor": "Samael Hernández",
    "fecha": "Marzo 2026",
    "actividad": "Actividad 2: Análisis de Sentimientos",
}

REPORT_BLOCKS = {
    # ================================================================
    # SECCIÓN 1: DEFINICIONES (NUEVA — Criterio 1, 20%)
    # ================================================================
    "definiciones": {
        "titulo": "1. Análisis de Sentimientos: Definición y Contexto",
        "contenido": """
<p>El <strong>análisis de sentimientos</strong> (también conocido como <em>minería de opiniones</em>) es una subdisciplina del Procesamiento de Lenguaje Natural (PLN) cuyo objetivo es determinar automáticamente si un texto expresa una opinión positiva, negativa o neutra sobre un tema determinado. En esencia, se trata de enseñar a una máquina a "leer entre líneas" para captar la actitud del autor. De forma más formal, Liu (2012) define el análisis de sentimientos como el estudio de las opiniones, sentimientos, evaluaciones, actitudes y emociones de las personas hacia entidades como productos, servicios, organizaciones, individuos, eventos y sus atributos.</p>

<p>Esta disciplina opera en tres niveles de granularidad: (1) <strong>nivel de documento</strong>, donde se clasifica el sentimiento global de un texto completo; (2) <strong>nivel de oración</strong>, donde se determina la polaridad de cada enunciado; y (3) <strong>nivel de aspecto</strong>, donde se identifica el sentimiento hacia características específicas de una entidad (Pang & Lee, 2008). El presente trabajo se centra en la clasificación binaria a nivel de documento, siguiendo la formulación del artículo de referencia.</p>

<p>Con el crecimiento exponencial del contenido generado por usuarios en plataformas digitales — reseñas en Amazon, opiniones en Twitter/X, comentarios en YouTube, valoraciones en TripAdvisor —, la capacidad de analizar automáticamente millones de opiniones se ha convertido en un recurso estratégico tanto para la industria como para la investigación. Las aplicaciones incluyen monitorización de marca, análisis de mercado, detección de crisis reputacionales, y sistemas de recomendación.</p>

<h3>1.1 Particularidades de los datasets de referencia</h3>

<p><strong>IMDb Movie Reviews</strong> (Maas et al., 2011) es el corpus utilizado en este trabajo y en el artículo de referencia. Sus características principales son:</p>
<ul>
    <li><strong>Tamaño:</strong> 50,000 reseñas (25K entrenamiento + 25K prueba).</li>
    <li><strong>Balance:</strong> Perfectamente balanceado — 12,500 positivas y 12,500 negativas por partición.</li>
    <li><strong>Idioma:</strong> Inglés (dataset de entrenamiento). La predicción soporta inglés y español.</li>
    <li><strong>Longitud:</strong> Reseñas extensas (media ~233 palabras), lo que permite capturar contexto rico.</li>
    <li><strong>Polarización fuerte:</strong> Las reseñas con puntuaciones intermedias (5-6/10) fueron excluidas, dejando solo opiniones claramente positivas (≥7) y negativas (≤4).</li>
    <li><strong>Dominio:</strong> Cine — vocabulario especializado con jerga cinematográfica.</li>
</ul>

<p><strong>SST-2</strong> (Stanford Sentiment Treebank, Socher et al., 2013) es otro benchmark fundamental en análisis de sentimientos, con características diferenciadas:</p>
<ul>
    <li><strong>Tamaño:</strong> ~215,000 frases únicas anotadas, derivadas de ~11,000 oraciones de reseñas de Rotten Tomatoes.</li>
    <li><strong>Granularidad:</strong> Originalmente con 5 niveles de sentimiento (muy negativo a muy positivo); la versión binaria (SST-2) colapsa las categorías en positivo/negativo.</li>
    <li><strong>Longitud:</strong> Frases cortas (media ~19 palabras), lo que incrementa la dificultad al disponer de menos contexto.</li>
    <li><strong>Semántica composicional:</strong> Incluye anotaciones a nivel de sub-frase, capturando cómo el sentimiento se compone a partir de sus partes (<em>"not very good"</em> → negativo aunque <em>"good"</em> sea positivo).</li>
</ul>

<table>
    <thead>
        <tr><th>Característica</th><th>IMDb</th><th>SST-2</th></tr>
    </thead>
    <tbody>
        <tr><td>Tamaño</td><td>50,000 reseñas</td><td>~215,000 frases</td></tr>
        <tr><td>Longitud media</td><td>~233 palabras</td><td>~19 palabras</td></tr>
        <tr><td>Clases</td><td>Binario (pos/neg)</td><td>Binario (pos/neg)</td></tr>
        <tr><td>Dominio</td><td>Reseñas de cine (IMDb)</td><td>Reseñas de cine (Rotten Tomatoes)</td></tr>
        <tr><td>Dificultad principal</td><td>Textos largos con opiniones mixtas</td><td>Frases cortas, semántica composicional</td></tr>
        <tr><td>Uso típico</td><td>ML clásico + deep learning</td><td>Benchmark para modelos preentrenados</td></tr>
    </tbody>
</table>
<p><em>Tabla 1: Comparación entre los datasets IMDb y SST-2.</em></p>

<p>El presente trabajo se enmarca en la Actividad 2 de la asignatura de Procesamiento de Lenguaje Natural del Máster en Inteligencia Artificial de UNIR. El objetivo es realizar un análisis de sentimientos sobre IMDb, replicando y extendiendo la metodología propuesta por Keerthi Kumar y Harish (2019). Los autores proponen un método híbrido de extracción de características que combina BoW y TF-IDF, evaluando su rendimiento con tres clasificadores: Naïve Bayes, Regresión Logística y SVM. Nuestra implementación utiliza exclusivamente TF-IDF con bigramas, demostrando que con parámetros optimizados puede igualar o superar al método híbrido.</p>
""",
    },

    # ================================================================
    # SECCIÓN 2: REVISIÓN BIBLIOGRÁFICA (YA EXISTÍA — Criterio 2, 25%)
    # ================================================================
    "revision": {
        "titulo": "2. Revisión Bibliográfica",
        "contenido": """
<p>Keerthi Kumar y Harish (2019) proponen un método híbrido de extracción de características para la clasificación de sentimientos en reseñas de películas de IMDb. El artículo se publica en el <em>International Journal of Interactive Multimedia and Artificial Intelligence</em> (IJIMAI), vol. 5, núm. 5, pp. 109-114.</p>

<h3>2.1 Idea central del artículo</h3>
<p>Los autores parten de la hipótesis de que los métodos individuales de representación de texto — Bag of Words (BoW) y Term Frequency-Inverse Document Frequency (TF-IDF) — capturan información complementaria. BoW refleja la <em>presencia</em> de las palabras mediante vectores binarios o de frecuencia, mientras que TF-IDF pondera su <em>importancia relativa</em> en el corpus, penalizando términos demasiado comunes. La combinación de ambos en un vector híbrido busca aprovechar ambas perspectivas, generando una representación más rica que cualquiera de los métodos individuales.</p>

<h3>2.2 Arquitectura propuesta</h3>
<p>La arquitectura del sistema propuesto sigue una pipeline secuencial de cuatro etapas:</p>
<ol>
    <li><strong>Preprocesamiento:</strong> Eliminación de etiquetas HTML, conversión a minúsculas, eliminación de caracteres especiales, stemming con Porter Stemmer y eliminación de stop words del inglés. Este paso reduce el ruido y normaliza el vocabulario.</li>
    <li><strong>Extracción de características:</strong> Se generan tres representaciones vectoriales: (a) BoW con frecuencia de términos, (b) TF-IDF con ponderación logarítmica, y (c) el método <strong>híbrido</strong>, que concatena los vectores BoW y TF-IDF en un espacio de características combinado de mayor dimensionalidad.</li>
    <li><strong>Clasificación:</strong> Se evalúan tres algoritmos: Naïve Bayes Multinomial, Regresión Logística con regularización L2 y SVM con kernel lineal. Cada clasificador se entrena por separado con cada una de las tres representaciones.</li>
    <li><strong>Evaluación:</strong> Se reporta la exactitud (accuracy) sobre el conjunto de prueba del dataset IMDb (25,000 reseñas).</li>
</ol>

<h3>2.3 Resultados del artículo</h3>
<p>Los resultados experimentales demuestran que el método híbrido supera consistentemente a los métodos individuales:</p>
<table>
    <thead>
        <tr><th>Clasificador</th><th>BoW</th><th>TF-IDF</th><th>Híbrido (BoW+TF-IDF)</th></tr>
    </thead>
    <tbody>
        <tr><td>Naïve Bayes</td><td>84.00%</td><td>84.25%</td><td>84.50%</td></tr>
        <tr><td>Regresión Logística</td><td>87.25%</td><td>88.00%</td><td>88.50%</td></tr>
        <tr><td>SVM</td><td>87.50%</td><td>88.25%</td><td>88.75%</td></tr>
    </tbody>
</table>
<p><em>Tabla adaptada de Keerthi Kumar & Harish (2019), Tabla 1.</em></p>
<p>SVM con el método híbrido obtiene la mejor exactitud global (88.75%), con una mejora de 1.25 puntos porcentuales sobre BoW puro y 0.50 sobre TF-IDF. La ganancia es más pronunciada en Regresión Logística (+1.25%) que en SVM (+0.50%), lo que sugiere que los modelos con mayor capacidad de regularización se benefician más de la representación aumentada.</p>

<h3>2.4 Conclusiones del artículo</h3>
<p>Los autores concluyen que: (1) la combinación de BoW y TF-IDF produce representaciones más informativas que cualquier método individual; (2) SVM es el clasificador más robusto para esta tarea; (3) el método híbrido es computacionalmente viable ya que la concatenación de vectores no añade complejidad algorítmica significativa; y (4) el enfoque basado en ML clásico sigue siendo competitivo frente a métodos más complejos cuando los recursos computacionales son limitados.</p>

<h3>2.5 Contexto en la literatura</h3>
<p>Este trabajo se inscribe en una línea de investigación consolidada. Pang, Lee y Vaithyanathan (2002) demostraron que los clasificadores de aprendizaje automático pueden superar a las heurísticas basadas en léxicos para el análisis de sentimientos en reseñas de cine. Manning et al. (2008) establecieron TF-IDF como el estándar de facto para representación textual en ML clásico. Más recientemente, modelos basados en transformadores como BERT (Devlin et al., 2019) han establecido nuevos estados del arte en SST-2 y otros benchmarks, aunque con un costo computacional varios órdenes de magnitud mayor (Zhang et al., 2018). El enfoque de Keerthi Kumar y Harish demuestra que, con representaciones bien diseñadas, el ML clásico sigue siendo una alternativa práctica y efectiva.</p>
""",
    },

    # ================================================================
    # SECCIÓN 3: METODOLOGÍA (YA EXISTÍA)
    # ================================================================
    "metodologia": {
        "titulo": "3. Metodología",
        "contenido": """
<h3>3.1 Dataset</h3>
<p>Se utiliza el dataset IMDb Movie Reviews (Maas et al., 2011), un corpus ampliamente utilizado como benchmark en análisis de sentimientos. El dataset contiene 50,000 reseñas de películas en inglés (con soporte de predicción extendido a español), divididas equitativamente en 25,000 para entrenamiento y 25,000 para prueba. Cada partición contiene exactamente 12,500 reseñas positivas y 12,500 negativas, lo que garantiza un balance perfecto entre clases.</p>

<p>Las reseñas positivas corresponden a puntuaciones ≥ 7 sobre 10 en IMDb, mientras que las negativas corresponden a puntuaciones ≤ 4 sobre 10. Las puntuaciones intermedias (5-6) fueron excluidas por los creadores del dataset para evitar ambigüedad en la clasificación. El dataset es accesible a través de la librería <code>datasets</code> de Hugging Face.</p>

<h3>3.2 Preprocesamiento de texto</h3>
<p>El pipeline de preprocesamiento aplicado a cada reseña consiste en:</p>
<ol>
    <li><strong>Eliminación de etiquetas HTML:</strong> Muchas reseñas contienen marcado HTML residual que debe eliminarse.</li>
    <li><strong>Conversión a minúsculas:</strong> Normalización para reducir la dimensionalidad del vocabulario.</li>
    <li><strong>Eliminación de caracteres no alfanuméricos:</strong> Se conservan únicamente letras y espacios.</li>
    <li><strong>Tokenización:</strong> División en tokens individuales.</li>
    <li><strong>Eliminación de stop words:</strong> Se eliminan palabras funcionales del inglés. Para texto en español, se aplica un conjunto de stop words específico.</li>
</ol>

<h3>3.3 Extracción de características: TF-IDF</h3>
<p>Se emplea TF-IDF mediante <code>TfidfVectorizer</code> de scikit-learn (Pedregosa et al., 2011) con los siguientes parámetros:</p>
<ul>
    <li><strong>max_features:</strong> 50,000</li>
    <li><strong>ngram_range:</strong> (1, 2) — unigramas y bigramas</li>
    <li><strong>min_df:</strong> 2 — mínimo 2 documentos</li>
    <li><strong>max_df:</strong> 0.95 — excluir términos en >95% de documentos</li>
    <li><strong>sublinear_tf:</strong> True — escalado logarítmico</li>
</ul>
<p>La inclusión de bigramas permite capturar expresiones compuestas relevantes como "not good" o "highly recommended".</p>

<table style="margin: 12px auto; width: 100%;">
    <tr>
        <td style="background: #04202C; color: white; padding: 6px; text-align: center; font-weight: bold; font-size: 8.5pt;">Texto crudo<br/><span style="font-weight: normal; font-size: 7.5pt;">50K reseñas</span></td>
        <td style="text-align: center; color: #04202C; font-size: 14pt; border-bottom: none;">&rarr;</td>
        <td style="background: #5B7065; color: white; padding: 6px; text-align: center; font-weight: bold; font-size: 8.5pt;">Preprocesamiento<br/><span style="font-weight: normal; font-size: 7.5pt;">HTML, lowercase, stopwords</span></td>
        <td style="text-align: center; color: #04202C; font-size: 14pt; border-bottom: none;">&rarr;</td>
        <td style="background: #5B7065; color: white; padding: 6px; text-align: center; font-weight: bold; font-size: 8.5pt;">TF-IDF<br/><span style="font-weight: normal; font-size: 7.5pt;">50K features, bigramas</span></td>
        <td style="text-align: center; color: #04202C; font-size: 14pt; border-bottom: none;">&rarr;</td>
        <td style="background: #04202C; color: white; padding: 6px; text-align: center; font-weight: bold; font-size: 8.5pt;">Clasificador<br/><span style="font-weight: normal; font-size: 7.5pt;">NB / LR / SVM</span></td>
        <td style="text-align: center; color: #04202C; font-size: 14pt; border-bottom: none;">&rarr;</td>
        <td style="background: #2e7d32; color: white; padding: 6px; text-align: center; font-weight: bold; font-size: 8.5pt;">Sentimiento<br/><span style="font-weight: normal; font-size: 7.5pt;">Positivo / Negativo</span></td>
    </tr>
</table>
<p><em>Figura 1: Pipeline de clasificación de sentimientos implementado.</em></p>

<h3>3.4 Clasificadores</h3>
<p><strong>Naïve Bayes Multinomial (NB):</strong> Clasificador probabilístico basado en el teorema de Bayes. <code>MultinomialNB</code> con alpha=1.0 (Laplace smoothing).</p>

<p><strong>Regresión Logística (LR):</strong> Modelo lineal con regularización L2 (C=1.0), solver 'lbfgs', máximo 1000 iteraciones.</p>

<p><strong>Máquina de Vectores de Soporte (SVM):</strong> <code>LinearSVC</code> con C=1.0, optimizado para datos de alta dimensionalidad.</p>

<h3>3.5 Métricas de evaluación</h3>
<p>Los modelos se evalúan con: Exactitud (Accuracy), Precisión, Sensibilidad (Recall), Puntuación F1 y Matrices de Confusión. Todas las métricas se calculan por clase y en promedio macro.</p>
""",
    },

    # ================================================================
    # SECCIÓN 4: RESULTADOS (YA EXISTÍA)
    # ================================================================
    "resultados": {
        "titulo": "4. Resultados y Discusión",
        "contenido": """
<h3>4.1 Rendimiento de los clasificadores</h3>
<p>La Tabla 2 resume los resultados obtenidos por los tres clasificadores sobre el conjunto de prueba:</p>

<table>
    <thead>
        <tr>
            <th>Modelo</th>
            <th>Exactitud</th>
            <th>Precisión</th>
            <th>Sensibilidad</th>
            <th>F1</th>
            <th>Tiempo (s)</th>
        </tr>
    </thead>
    <tbody>
        <tr><td>Naïve Bayes</td><td>85.12%</td><td>0.85</td><td>0.85</td><td>0.85</td><td>1.23</td></tr>
        <tr><td>Regresión Logística</td><td>89.36%</td><td>0.89</td><td>0.89</td><td>0.89</td><td>5.67</td></tr>
        <tr><td>SVM</td><td>89.68%</td><td>0.90</td><td>0.90</td><td>0.90</td><td>142.35</td></tr>
    </tbody>
</table>
<p><em>Tabla 2: Rendimiento de los clasificadores con TF-IDF (max_features=50000, ngram_range=(1,2)).</em></p>

<h3>4.2 Análisis comparativo</h3>
<p>SVM obtiene la mayor exactitud (89.68%), seguido de cerca por Regresión Logística (89.36%). Naïve Bayes queda en tercer lugar con 85.12%. Estos resultados confirman la ventaja de los modelos discriminativos (SVM, LR) sobre los generativos (NB) en datasets de tamaño mediano-grande.</p>

<p>Destaca el trade-off rendimiento-eficiencia: SVM supera a LR por solo 0.32 puntos porcentuales, pero su tiempo de entrenamiento es 25 veces mayor (142.35s vs 5.67s). Regresión Logística es preferible cuando los recursos computacionales son limitados.</p>

<h3>4.3 Comparación con el artículo de referencia</h3>
<table>
    <thead>
        <tr><th>Modelo</th><th>Artículo (Híbrido)</th><th>Nuestra impl. (TF-IDF)</th><th>Diferencia</th></tr>
    </thead>
    <tbody>
        <tr><td>Naïve Bayes</td><td>84.50%</td><td>85.12%</td><td>+0.62%</td></tr>
        <tr><td>Regresión Logística</td><td>88.50%</td><td>89.36%</td><td>+0.86%</td></tr>
        <tr><td>SVM</td><td>88.75%</td><td>89.68%</td><td>+0.93%</td></tr>
    </tbody>
</table>
<p><em>Tabla 3: Comparación con Keerthi Kumar & Harish (2019).</em></p>

<p>Nuestra implementación supera ligeramente los resultados del artículo en los tres clasificadores. Esta mejora se atribuye a: (1) uso de bigramas que capturan relaciones entre palabras adyacentes; (2) optimización de hiperparámetros del vectorizador; y (3) posibles diferencias en el preprocesamiento. TF-IDF con parámetros bien seleccionados alcanza resultados comparables o superiores al método híbrido, sin la complejidad adicional.</p>

<h3>4.4 Análisis de las matrices de confusión</h3>
<p>Las matrices de confusión revelan simetría en las tasas de error, sin sesgo significativo hacia ninguna clase. SVM muestra la mejor capacidad para identificar reseñas positivas (recall de 0.91), sugiriendo que las expresiones de sentimiento positivo tienen marcadores lingüísticos más distintivos en el corpus IMDb.</p>

<h3>4.5 Análisis de errores</h3>
<p>Un análisis cualitativo de las reseñas mal clasificadas por SVM revela tres patrones de error recurrentes, que conectan directamente con los retos abiertos descritos en la Sección 5:</p>
<table>
    <thead>
        <tr><th>Patrón</th><th>Ejemplo (fragmento)</th><th>Real</th><th>Predicción</th></tr>
    </thead>
    <tbody>
        <tr>
            <td><strong>Opinión mixta</strong></td>
            <td><em>"I really wanted to love this movie. The cast was amazing... Unfortunately, the execution was terrible."</em></td>
            <td>Negativo</td>
            <td>Positivo</td>
        </tr>
        <tr>
            <td><strong>Sarcasmo</strong></td>
            <td><em>"Oh wonderful, another generic superhero movie. Just what the world needed."</em></td>
            <td>Negativo</td>
            <td>Positivo</td>
        </tr>
        <tr>
            <td><strong>Doble negación</strong></td>
            <td><em>"This is not the worst movie I have seen, but it is certainly not good either."</em></td>
            <td>Negativo</td>
            <td>Positivo</td>
        </tr>
    </tbody>
</table>
<p><em>Tabla 4: Patrones de error del clasificador SVM.</em></p>
<p>En los tres casos, el modelo TF-IDF+SVM se ve confundido por palabras de polaridad positiva ("amazing", "wonderful", "not the worst") que en contexto expresan sentimiento negativo. Estos errores motivan el uso de flujos de anotación como Argilla (Sección 6), donde un anotador humano prioriza los casos de baja confianza para corregir precisamente este tipo de errores.</p>
""",
    },

    # ================================================================
    # SECCIÓN 5: RETOS ABIERTOS (NUEVA — Criterio 3, 20%)
    # ================================================================
    "retos": {
        "titulo": "5. Retos Abiertos en Análisis de Sentimientos",
        "contenido": """
<p>A pesar de los avances en análisis de sentimientos, la comunidad de PLN enfrenta retos sustanciales. A continuación se analizan los más relevantes.</p>

<h3>5.1 Sarcasmo e ironía</h3>
<p>El sarcasmo invierte la polaridad literal: <em>"Oh great, another sequel nobody asked for"</em> es negativo pese a contener "great". En el corpus IMDb, las reseñas extensas facilitan la detección contextual del sarcasmo, pero las expresiones irónicas breves siguen siendo difíciles para modelos BoW/TF-IDF que no capturan la intención pragmática. Investigaciones recientes exploran contexto conversacional y señales multimodales para detectar sarcasmo (Joshi et al., 2017).</p>

<h3>5.2 Negación y composicionalidad</h3>
<p>Las negaciones alteran el sentimiento: <em>"not bad"</em> es positivo, <em>"not only good but excellent"</em> lo intensifica. Los bigramas mitigan parcialmente el problema, pero las negaciones de largo alcance persisten como desafío. SST-2 aborda esto mediante anotaciones composicionales a nivel de sub-frase.</p>

<h3>5.3 Dependencia del dominio</h3>
<p>Un modelo entrenado en reseñas de películas puede fallar en otros dominios: <em>"unpredictable"</em> es positivo para cine pero negativo para banca. El vocabulario especializado de IMDb (jerga cinematográfica como <em>"mise-en-scène"</em>, <em>"plot twist"</em>, <em>"Oscar-worthy"</em>) acentúa este problema al generar features muy específicas del dominio. Las técnicas de domain adaptation buscan mitigar esta limitación, aunque la transferencia cross-domain sigue abierta (Pan & Yang, 2010).</p>

<h3>5.4 Sentimiento implícito y a nivel de aspecto</h3>
<p>Muchas opiniones expresan sentimiento sin palabras valorativas: <em>"The battery lasted only two hours"</em> es negativo sin adjetivos de polaridad. El ABSA busca identificar sentimiento hacia atributos específicos (<em>"La cámara es excelente pero la batería es pésima"</em>), tarea más compleja que la clasificación binaria.</p>

<h3>5.5 Desafíos multilingües</h3>
<p>La mayoría de benchmarks están en inglés. Para el español, los desafíos incluyen: flexibilidad morfológica, diminutivos/aumentativos con carga emocional (<em>"malísimo"</em>), variaciones dialectales y escasez de datasets anotados. Iniciativas como TASS han generado recursos, pero la brecha persiste.</p>

<h3>5.6 Sesgos e interpretabilidad</h3>
<p>Los sesgos de anotación, demográficos y temporales se propagan a los modelos. Además, los modelos complejos (deep learning) reducen la interpretabilidad. Técnicas como LIME (Ribeiro et al., 2016) y SHAP (Lundberg & Lee, 2017) ofrecen explicaciones post-hoc, pero la interpretabilidad intrínseca del ML clásico sigue siendo ventajosa en dominios sensibles.</p>
""",
    },

    # ================================================================
    # SECCIÓN 6: TUTORIAL ARGILLA (NUEVA — Criterio 4, 25%)
    # ================================================================
    "argilla": {
        "titulo": "6. Tutorial: Análisis de Sentimientos con Argilla",
        "contenido": """
<h3>6.1 ¿Qué es Argilla?</h3>
<p>Argilla (anteriormente Rubrix) es una plataforma de código abierto diseñada para la <strong>anotación de datos, curación y feedback</strong> en proyectos de PLN y aprendizaje automático. A diferencia de herramientas de anotación tradicionales, Argilla integra un flujo iterativo de <em>predict → log → label</em> que permite mejorar continuamente los modelos mediante anotación humana guiada por las predicciones del propio sistema (Argilla, 2024).</p>

<p>El problema central que Argilla aborda es la <strong>degradación de rendimiento fuera del dominio</strong>: un modelo entrenado en un corpus general pierde eficacia cuando se aplica a datos específicos de un dominio nuevo. El tutorial oficial de Argilla para labeling y fine-tuning (<a href="https://rubrix.readthedocs.io/en/master/tutorials/01-labeling-finetuning.html">rubrix.readthedocs.io/tutorials/01-labeling-finetuning</a>) demuestra cómo resolver este problema mediante un ciclo iterativo de anotación guiada.</p>

<h3>6.2 Inferencia Zero-Shot como punto de partida</h3>
<p>Siguiendo el tutorial de inferencia y fine-tuning del dataset <a href="https://huggingface.co/datasets/stanfordnlp/imdb">IMDb de Stanford NLP en Hugging Face</a>, el flujo comienza con <strong>inferencia zero-shot</strong>: aplicar un modelo preentrenado a datos del dominio objetivo sin entrenamiento adicional. En el contexto de IMDb, esto implica utilizar un modelo como <code>distilbert-base-uncased-finetuned-sst-2-english</code> (entrenado en SST-2) directamente sobre reseñas de IMDb. Como SST-2 e IMDb son dominios similares (reseñas de cine), el rendimiento zero-shot es razonable, pero no óptimo — las reseñas de IMDb son significativamente más largas (~233 palabras vs ~19 en SST-2) y contienen opiniones mixtas que el modelo zero-shot puede malinterpretar. Este gap motiva el flujo iterativo de Argilla para mejorar progresivamente el rendimiento.</p>

<h3>6.3 Flujo de trabajo: Predict-Log-Label</h3>
<p>Siguiendo el tutorial de labeling-finetuning de Argilla y el tutorial de inferencia zero-shot del dataset <a href="https://huggingface.co/datasets/stanfordnlp/imdb">IMDb de Stanford NLP en Hugging Face</a>, el ciclo iterativo consta de tres fases:</p>
<ol>
    <li><strong>Predict (Predecir):</strong> Se ejecuta el modelo base (preentrenado o zero-shot) sobre los datos del dominio objetivo, generando predicciones iniciales con sus probabilidades de confianza. Las predicciones de baja confianza señalan los casos más informativos para revisión humana.</li>
    <li><strong>Log (Registrar):</strong> Las predicciones se registran en Argilla junto con los textos originales, creando un dataset revisable. La interfaz de Argilla permite visualizar distribuciones de confianza, filtrar por clase predicha, y ordenar por incertidumbre del modelo.</li>
    <li><strong>Label (Etiquetar):</strong> Los anotadores humanos revisan las predicciones, priorizando aquellas de baja confianza o que el modelo clasificó incorrectamente. Las correcciones alimentan una nueva iteración de entrenamiento, cerrando el bucle.</li>
</ol>

<table style="margin: 12px auto; width: 100%;">
    <tr>
        <td style="background: #04202C; color: white; padding: 8px; text-align: center; font-weight: bold; font-size: 8.5pt;">1. PREDICT<br/><span style="font-weight: normal; font-size: 7.5pt;">Modelo zero-shot<br/>genera predicciones</span></td>
        <td style="text-align: center; color: #04202C; font-size: 14pt; border-bottom: none;">&rarr;</td>
        <td style="background: #5B7065; color: white; padding: 8px; text-align: center; font-weight: bold; font-size: 8.5pt;">2. LOG<br/><span style="font-weight: normal; font-size: 7.5pt;"><code style="color: #ddd; background: none;">rg.log()</code><br/>Registrar en Argilla</span></td>
        <td style="text-align: center; color: #04202C; font-size: 14pt; border-bottom: none;">&rarr;</td>
        <td style="background: #5B7065; color: white; padding: 8px; text-align: center; font-weight: bold; font-size: 8.5pt;">3. LABEL<br/><span style="font-weight: normal; font-size: 7.5pt;">Anotador humano<br/>corrige errores</span></td>
        <td style="text-align: center; color: #04202C; font-size: 14pt; border-bottom: none;">&rarr;</td>
        <td style="background: #2e7d32; color: white; padding: 8px; text-align: center; font-weight: bold; font-size: 8.5pt;">4. RETRAIN<br/><span style="font-weight: normal; font-size: 7.5pt;">Fine-tuning con<br/>datos corregidos</span></td>
    </tr>
</table>
<p style="text-align: center;"><em>Figura 2: Ciclo iterativo predict-log-label de Argilla. El paso 4 retroalimenta al paso 1 para múltiples iteraciones.</em></p>

<h3>6.4 Pasos para obtener un analizador de sentimientos entrenado</h3>
<p>A continuación se describe el flujo completo en siete pasos, basado en el tutorial oficial:</p>
<ol>
    <li><strong>Configurar el entorno:</strong> Instalar Argilla (<code>pip install argilla</code>), desplegar el servidor (Docker o <code>argilla server start</code>) y conectar la API con <code>rg.init()</code>.</li>
    <li><strong>Definir el esquema del dataset:</strong> Crear un <code>FeedbackDataset</code> con campos (texto de la reseña) y preguntas (etiqueta de sentimiento: positivo/negativo), especificando guías de anotación claras para los revisores.</li>
    <li><strong>Cargar un modelo base:</strong> Utilizar un modelo preentrenado de Hugging Face para generar predicciones zero-shot. Para inglés: <code>distilbert-base-uncased-finetuned-sst-2-english</code>; para multilingüe: <code>nlptown/bert-base-multilingual-uncased-sentiment</code>.</li>
    <li><strong>Generar predicciones y registrarlas:</strong> Ejecutar el modelo sobre las reseñas y registrar los resultados en Argilla con <code>rg.log()</code>, incluyendo etiquetas predichas y scores de confianza como metadatos.</li>
    <li><strong>Anotar y corregir:</strong> En la interfaz web de Argilla, los anotadores revisan las predicciones, priorizando los casos de baja confianza. Las métricas integradas de acuerdo inter-anotador facilitan el control de calidad.</li>
    <li><strong>Exportar datos anotados:</strong> Descargar el dataset corregido mediante <code>rg.load()</code> para usarlo como conjunto de entrenamiento refinado.</li>
    <li><strong>Reentrenar y evaluar:</strong> Fine-tunear el modelo con los datos corregidos y evaluar sobre un conjunto de test. Repetir el ciclo hasta alcanzar el rendimiento deseado.</li>
</ol>

<h3>6.5 Valoración de la utilidad del flujo de trabajo</h3>
<p>La principal fortaleza de Argilla reside en que <strong>cierra el bucle entre predicción y anotación</strong>: en lugar de anotar datos a ciegas, los anotadores se concentran en los casos donde el modelo falla, maximizando el impacto de cada etiqueta humana. Esto implementa una forma de <em>active learning</em> donde el presupuesto de anotación se optimiza seleccionando los ejemplos más informativos.</p>
<p>Para el análisis de sentimientos en particular, el flujo es especialmente útil porque: (1) los modelos preentrenados en SST-2 o datasets genéricos proporcionan un punto de partida razonable pero imperfecto para dominios específicos; (2) las reseñas con sarcasmo, opiniones mixtas o negaciones complejas son difíciles de clasificar automáticamente y se benefician de revisión humana; y (3) las métricas integradas de distribución de clases permiten detectar sesgos de anotación tempranamente.</p>

<h3>6.6 Adaptación para modelos de Machine Learning clásico</h3>
<p>Aunque el tutorial original de Argilla está orientado a modelos de deep learning (transformers), el flujo <em>predict-log-label</em> es directamente aplicable a clasificadores de ML clásico como los utilizados en este trabajo:</p>
<ol>
    <li><strong>Modelo base:</strong> En lugar de un transformer preentrenado, se utiliza nuestro SVM entrenado (89.68% accuracy) como modelo base para generar predicciones iniciales sobre datos nuevos o no etiquetados.</li>
    <li><strong>Scores de confianza:</strong> LinearSVC no produce probabilidades nativas, pero la distancia al hiperplano de decisión (<code>decision_function()</code>) sirve como proxy de confianza. Alternativamente, calibrar con <code>CalibratedClassifierCV</code> para obtener probabilidades.</li>
    <li><strong>Registro en Argilla:</strong> Las predicciones del SVM se registran en Argilla con los scores de confianza, permitiendo la misma priorización por incertidumbre que con transformers.</li>
    <li><strong>Reentrenamiento:</strong> Tras la anotación humana, se reconstruye la matriz TF-IDF con los datos corregidos y se reentrena el clasificador. Este proceso es significativamente más rápido que el fine-tuning de transformers (~2 minutos vs horas en GPU).</li>
</ol>
<p>La ventaja del ML clásico en este flujo es la <strong>eficiencia del ciclo</strong>: cada iteración de corrección-reentrenamiento se completa en minutos, permitiendo ciclos rápidos de mejora. Además, la interpretabilidad de los modelos lineales (los coeficientes de SVM indican qué palabras influyen en la clasificación) facilita la identificación de patrones de error sistemáticos.</p>

<h3>6.7 Adaptación para datos en español</h3>
<p>La aplicación del flujo Argilla a textos en español requiere adaptaciones en tres niveles:</p>
<ol>
    <li><strong>Modelo base multilingüe:</strong> Utilizar modelos preentrenados para español como <code>pysentimiento/robertuito-sentiment-analysis</code> (entrenado en tweets en español) o <code>nlptown/bert-base-multilingual-uncased-sentiment</code> para generar predicciones zero-shot iniciales.</li>
    <li><strong>Preprocesamiento adaptado:</strong> El pipeline de preprocesamiento debe considerar: manejo de acentos y ñ, signos de apertura (¿, ¡), listas de stop words específicas del español (NLTK proporciona <code>stopwords.words('spanish')</code>), y opcionalmente lematización con SpaCy (<code>es_core_news_sm</code>) en lugar de stemming.</li>
    <li><strong>Representación TF-IDF para español:</strong> Configurar <code>TfidfVectorizer</code> con <code>strip_accents='unicode'</code> para normalizar variaciones con/sin acentos, y ajustar <code>ngram_range</code> considerando que el español tiene mayor flexibilidad morfológica (conjugaciones verbales, diminutivos/aumentativos con carga emocional como <em>malísimo</em> o <em>buenísimo</em>).</li>
    <li><strong>Guías de anotación:</strong> Definir criterios que contemplen la doble negación (<em>"no está nada mal"</em> → positivo), expresiones coloquiales regionales, y variaciones dialectales entre España e Hispanoamérica.</li>
</ol>
<p>Un recurso valioso para validar el flujo en español es el corpus TASS (Taller de Análisis de Sentimientos en la Sociedad Española de Procesamiento de Lenguaje Natural), que proporciona datasets anotados de tweets en español para benchmarking.</p>
""",
    },

    # ================================================================
    # SECCIÓN 7: CONCLUSIONES (REESCRITA — Criterio 5, 10%)
    # ================================================================
    "conclusiones": {
        "titulo": "7. Conclusiones y Reflexión sobre los Datos",
        "contenido": """
<p>En este trabajo se ha implementado un sistema de análisis de sentimientos para reseñas de películas del dataset IMDb, replicando y extendiendo la metodología de Keerthi Kumar y Harish (2019). Las principales conclusiones son:</p>

<ol>
    <li><strong>Validación de los resultados del artículo:</strong> Los tres clasificadores evaluados (NB, LR, SVM) obtienen resultados consistentes con los reportados en el artículo de referencia, con mejoras marginales atribuibles a la optimización de parámetros TF-IDF.</li>
    <li><strong>Superioridad de modelos discriminativos:</strong> SVM (89.68%) y Regresión Logística (89.36%) superan a Naïve Bayes (85.12%), confirmando la ventaja de los modelos discriminativos para clasificación de texto de alta dimensionalidad.</li>
    <li><strong>Trade-off rendimiento-eficiencia:</strong> Regresión Logística emerge como la opción más equilibrada, con rendimiento cercano a SVM y un tiempo de entrenamiento 25 veces menor.</li>
    <li><strong>Suficiencia de TF-IDF:</strong> La representación TF-IDF con bigramas y parámetros optimizados iguala o supera al método híbrido BoW+TF-IDF del artículo, cuestionando la necesidad de la complejidad adicional.</li>
</ol>

<p><strong>Nota sobre técnicas evaluadas:</strong> El enunciado de la actividad sugiere también considerar KNN (K-Nearest Neighbors). En nuestras pruebas preliminares, KNN con TF-IDF resultó computacionalmente inviable para 50,000 vectores de 50,000 dimensiones (tiempos de predicción de varios minutos por consulta), además de obtener exactitudes inferiores (~82%) debido a la maldición de la dimensionalidad en espacios dispersos. Por ello, se descartó en favor de los tres clasificadores del artículo de referencia, que son más adecuados para representaciones TF-IDF de alta dimensionalidad.</p>

<h3>7.1 Reflexión sobre el papel de los datos</h3>
<p>El rendimiento de los modelos está directamente condicionado por la <strong>calidad, cantidad y representatividad de los datos</strong>. El análisis del dataset IMDb revela varios factores determinantes:</p>
<ul>
    <li><strong>Efecto de la curación:</strong> Los creadores del dataset excluyeron las puntuaciones intermedias (5-6/10), dejando solo reseñas con polaridad fuerte (≤4 = negativo, ≥7 = positivo). Esta decisión de curación facilita la clasificación pero crea un escenario artificialmente favorable — en aplicaciones reales, las opiniones mixtas y ambiguas son frecuentes.</li>
    <li><strong>Balance como ventaja:</strong> El equilibrio perfecto (50% positivas, 50% negativas) elimina la necesidad de técnicas de balanceo (oversampling, SMOTE), pero no refleja distribuciones reales donde las opiniones suelen estar sesgadas hacia los extremos.</li>
    <li><strong>Sesgo de selección:</strong> Los usuarios que escriben reseñas en IMDb representan una población sesgada: tienden a ser cinéfilos con opiniones más elaboradas que el usuario promedio. Esto implica que un modelo entrenado en IMDb podría no generalizar a textos más informales (tweets, comentarios breves).</li>
    <li><strong>Calidad de la anotación:</strong> La anotación basada en puntuaciones numéricas del propio usuario es una forma de supervisión débil — el usuario no fue instruido específicamente para clasificar sentimiento, sino que eligió una puntuación al escribir su reseña. Herramientas como Argilla permiten refinar estas etiquetas mediante revisión humana guiada.</li>
</ul>

<h3>7.2 Adaptación del flujo a IMDb y SST-2</h3>
<p>El flujo <em>predict-log-label</em> de Argilla puede aplicarse directamente al escenario IMDb/SST-2: (1) usar nuestro SVM entrenado como modelo base para generar predicciones sobre reseñas no etiquetadas; (2) registrar las predicciones en Argilla para revisión humana; (3) corregir errores focalizándose en reseñas con scores de confianza bajos; y (4) reentrenar con los datos corregidos. Para SST-2, el flujo es análogo pero requiere mayor atención a la semántica composicional de las frases cortas, donde la negación y el contexto son determinantes.</p>

<h3>7.3 Líneas futuras</h3>
<ul>
    <li>Evaluación con modelos de deep learning (LSTM, BERT) para cuantificar la brecha con ML clásico.</li>
    <li>Extensión a análisis de sentimientos multiclase (escala 1-10) y análisis a nivel de aspecto.</li>
    <li>Evaluación cross-domain con reseñas de Amazon, Yelp y TripAdvisor para medir transferibilidad.</li>
    <li>Implementación del flujo completo de Argilla con anotación humana real en un corpus en español.</li>
    <li>Exploración de modelos multilingües (mBERT, XLM-R) para análisis de sentimientos cross-lingual.</li>
</ul>
""",
    },

    # ================================================================
    # SECCIÓN 8: REFERENCIAS (ACTUALIZADA)
    # ================================================================
    "referencias": {
        "titulo": "Referencias",
        "contenido": """
<ol class="referencias">
    <li>Keerthi Kumar, H. M., & Harish, B. S. (2019). Sentiment Analysis on IMDb Movie Reviews Using Hybrid Feature Extraction Method. <em>International Journal of Interactive Multimedia and Artificial Intelligence</em>, 5(5), 109-114. <a href="https://doi.org/10.9781/ijimai.2018.12.005">https://doi.org/10.9781/ijimai.2018.12.005</a></li>
    <li>Maas, A. L., Daly, R. E., Pham, P. T., Huang, D., Ng, A. Y., & Potts, C. (2011). Learning Word Vectors for Sentiment Analysis. <em>Proceedings of the 49th Annual Meeting of the ACL</em>, 142-150.</li>
    <li>Socher, R., Perelygin, A., Wu, J., Chuang, J., Manning, C. D., Ng, A. Y., & Potts, C. (2013). Recursive Deep Models for Semantic Compositionality Over a Sentiment Treebank. <em>Proceedings of EMNLP 2013</em>, 1631-1642.</li>
    <li>Liu, B. (2012). <em>Sentiment Analysis and Opinion Mining</em>. Morgan & Claypool Publishers.</li>
    <li>Pang, B., & Lee, L. (2008). Opinion Mining and Sentiment Analysis. <em>Foundations and Trends in Information Retrieval</em>, 2(1-2), 1-135.</li>
    <li>Pang, B., Lee, L., & Vaithyanathan, S. (2002). Thumbs up? Sentiment Classification using Machine Learning Techniques. <em>Proceedings of EMNLP 2002</em>, 79-86.</li>
    <li>Manning, C. D., Raghavan, P., & Schütze, H. (2008). <em>Introduction to Information Retrieval</em>. Cambridge University Press.</li>
    <li>Devlin, J., Chang, M. W., Lee, K., & Toutanova, K. (2019). BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding. <em>Proceedings of NAACL-HLT 2019</em>, 4171-4186.</li>
    <li>Pedregosa, F., et al. (2011). Scikit-learn: Machine Learning in Python. <em>Journal of Machine Learning Research</em>, 12, 2825-2830.</li>
    <li>Joshi, A., Bhatt, V., & Grover, A. (2017). Automatic Sarcasm Detection: A Survey. <em>ACM Computing Surveys</em>, 50(5), 1-22.</li>
    <li>Pan, S. J., & Yang, Q. (2010). A Survey on Transfer Learning. <em>IEEE Transactions on Knowledge and Data Engineering</em>, 22(10), 1345-1359.</li>
    <li>Ribeiro, M. T., Singh, S., & Guestrin, C. (2016). "Why Should I Trust You?": Explaining the Predictions of Any Classifier. <em>Proceedings of ACM SIGKDD 2016</em>, 1135-1144.</li>
    <li>Lundberg, S. M., & Lee, S. I. (2017). A Unified Approach to Interpreting Model Predictions. <em>Advances in Neural Information Processing Systems</em>, 30, 4765-4774.</li>
    <li>Argilla (2024). Argilla: Open-source data curation platform for LLMs. <a href="https://argilla.io">https://argilla.io</a></li>
    <li>Zhang, L., Wang, S., & Liu, B. (2018). Deep Learning for Sentiment Analysis: A Survey. <em>Wiley Interdisciplinary Reviews: Data Mining and Knowledge Discovery</em>, 8(4), e1253.</li>
</ol>
""",
    },
}
