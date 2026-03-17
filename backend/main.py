import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from backend.routers import dataset, article, report, model, export, argilla

load_dotenv()

app = FastAPI(
    title="Análisis de Sentimientos - IMDb",
    description="API para análisis de sentimientos en reseñas de películas IMDb",
    version="1.0.0",
)

# CORS
origins = os.getenv("CORS_ORIGINS", "http://localhost:4200").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(dataset.router)
app.include_router(article.router)
app.include_router(report.router)
app.include_router(model.router)
app.include_router(export.router)
app.include_router(argilla.router)


@app.get("/")
def root():
    """Endpoint raiz con informacion basica de la API y enlace a la documentacion."""
    return {
        "message": "API de Análisis de Sentimientos - IMDb Movie Reviews",
        "docs": "/docs",
        "version": "1.0.0",
    }


@app.get("/api/health")
def health():
    """Health check para verificar que el servidor esta activo."""
    return {"status": "ok"}
