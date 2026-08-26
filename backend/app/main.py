from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings
from app.api.routes import (
    users,
    signatures,
    verification,
    quantum,
    attacks,
    statistics,
    experiments,
    audit,
    incidents
)


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Q-SHIELD Quantum Digital Signature Security Platform Backend Foundation",
    openapi_url=f"{settings.API_PREFIX}/openapi.json",
    docs_url=f"{settings.API_PREFIX}/docs",
    redoc_url=f"{settings.API_PREFIX}/redoc",
)

origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_prefix = settings.API_PREFIX
app.include_router(users.router, prefix=api_prefix)
app.include_router(signatures.router, prefix=api_prefix)
app.include_router(verification.router, prefix=api_prefix)
app.include_router(quantum.router, prefix=api_prefix)
app.include_router(attacks.router, prefix=api_prefix)
app.include_router(statistics.router, prefix=api_prefix)
app.include_router(experiments.router, prefix=api_prefix)
app.include_router(audit.router, prefix=api_prefix)
app.include_router(incidents.router, prefix=api_prefix)



@app.get("/health")
@app.get(f"{settings.API_PREFIX}/health")
def health_check():
    return {
        "status": "ok",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT
    }
