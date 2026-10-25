from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from .config import settings
from .database import engine, Base
from .models import User, Patient, Assessment
from .routers import (
    auth_router,
    dashboard_router,
    patients_router,
    assessments_router,
    reports_router,
)
from .services.model_loader import ModelLoader
from .seed import seed_database

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("cardiocheck")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    
    # Initialize ML model artifacts
    logger.info("Verifying ML model artifacts...")
    try:
        loader = ModelLoader.get_instance()
        logger.info("ML model loaded: %s", loader.model_info)
    except Exception as e:
        logger.error("Failed to initialize ML models on startup: %s", e)

    # Seed initial demo clinical data
    try:
        seed_database()
    except Exception as e:
        logger.error("Error during initial data seed: %s", e)

    yield
    logger.info("Shutting down CardioCheck backend.")

app = FastAPI(
    title="CardioCheck — Clinical Decision Support API",
    description=(
        "Backend API for CardioCheck clinical decision support interface. "
        "Integrates trained Cleveland Heart Disease Logistic Regression inference, "
        "patient record management, assessment history preservation, and PDF reports."
    ),
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware: supports configured origins, localhost, and any onrender.com domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"^https?:\/\/(localhost|127\.0\.0\.1|.*\.onrender\.com)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(patients_router)
app.include_router(assessments_router)
app.include_router(reports_router)

@app.get("/api/health", tags=["Health"])
@app.get("/api/v1/health", tags=["Health"])
def health_check():
    loader = ModelLoader.get_instance()
    return {
        "status": "healthy",
        "service": "CardioCheck Backend",
        "version": "1.0.0",
        "database": "connected",
        "model_loaded": loader.is_loaded,
        "model_info": loader.model_info,
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled error: %s on %s %s", exc, request.method, request.url, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal clinical server error occurred. Please contact system administration."}
    )
