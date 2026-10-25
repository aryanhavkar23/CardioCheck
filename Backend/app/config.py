import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    ENV: str = "development"
    DEBUG: bool = True
    APP_PORT: int = 8000
    APP_HOST: str = "0.0.0.0"

    DATABASE_URL: str = "sqlite:///./cardiocheck.db"

    JWT_SECRET_KEY: str = "cardiocheck-super-secret-development-key-change-in-production-2026"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    MODEL_DIR: str = "Models"
    LOGISTIC_REGRESSION_MODEL_PATH: str = "Models/logistic_regression_model.pkl"
    SCALER_PATH: str = "Models/heart_disease_scaler.pkl"
    RANDOM_FOREST_MODEL_PATH: str = "Models/random_forest_model.pkl"

    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:3000",
    ]

    model_config = SettingsConfigDict(env_file=".env", extra="allow")

settings = Settings()
