import os
import joblib
import logging
from typing import Tuple, Optional, Any
from ..config import settings

logger = logging.getLogger("cardiocheck.model_loader")

class ModelLoader:
    _instance = None

    def __init__(self):
        self.scaler = None
        self.logistic_model = None
        self.random_forest_model = None
        self.is_loaded = False
        self.model_info = {}
        self.load_artifacts()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = ModelLoader()
        return cls._instance

    def _resolve_path(self, path: str) -> Optional[str]:
        """Resolves file path checking multiple possible locations cross-platform."""
        if not path:
            return None
        from pathlib import Path
        p = Path(path)
        if p.is_file():
            return str(p.resolve())

        service_dir = Path(__file__).resolve().parent
        app_dir = service_dir.parent
        backend_dir = app_dir.parent
        repo_dir = backend_dir.parent
        cwd = Path.cwd()

        candidates = [
            cwd / path,
            cwd / "Backend" / path,
            cwd / "Models" / p.name,
            cwd / "Backend" / "Models" / p.name,
            backend_dir / path,
            backend_dir / "Models" / p.name,
            repo_dir / path,
            repo_dir / "Backend" / path,
            repo_dir / "Backend" / "Models" / p.name,
        ]
        for c in candidates:
            if c.is_file():
                return str(c.resolve())
        return None

    def load_artifacts(self):
        # 1. Load Scaler
        scaler_resolved = self._resolve_path(settings.SCALER_PATH) or self._resolve_path("Models/heart_disease_scaler.pkl") or self._resolve_path("heart_disease_scaler.pkl")
        if not scaler_resolved:
            raise FileNotFoundError(
                f"Heart disease scaler artifact not found. Looked for '{settings.SCALER_PATH}'. "
                "Ensure 'heart_disease_scaler.pkl' is placed in Backend/Models/."
            )
        try:
            self.scaler = joblib.load(scaler_resolved)
            logger.info("Successfully loaded scaler from %s", scaler_resolved)
        except Exception as e:
            raise RuntimeError(f"Failed to load scaler from {scaler_resolved}: {e}")

        # 2. Load Logistic Regression Model
        model_resolved = self._resolve_path(settings.LOGISTIC_REGRESSION_MODEL_PATH) or self._resolve_path("Models/logistic_regression_model.pkl") or self._resolve_path("logistic_regression_model.pkl")
        if not model_resolved:
            raise FileNotFoundError(
                f"Logistic regression model artifact not found. Looked for '{settings.LOGISTIC_REGRESSION_MODEL_PATH}'. "
                "Ensure 'logistic_regression_model.pkl' is placed in Backend/Models/."
            )
        try:
            self.logistic_model = joblib.load(model_resolved)
            logger.info("Successfully loaded Logistic Regression model from %s", model_resolved)
        except Exception as e:
            raise RuntimeError(f"Failed to load Logistic Regression model from {model_resolved}: {e}")

        # 3. Check Random Forest Model (Optional / Internal comparison only)
        rf_resolved = self._resolve_path(settings.RANDOM_FOREST_MODEL_PATH) or self._resolve_path("Models/random_forest_model.pkl")
        if rf_resolved:
            try:
                self.random_forest_model = joblib.load(rf_resolved)
                logger.info("Loaded comparison Random Forest model from %s", rf_resolved)
            except Exception as e:
                logger.warning("Random Forest model found at %s but failed to load: %s", rf_resolved, e)
        else:
            logger.info("Random Forest model artifact not present. Primary Logistic Regression model is active.")

        # Verification of features
        expected_features = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal']
        scaler_features = list(getattr(self.scaler, 'feature_names_in_', []))
        if scaler_features and scaler_features != expected_features:
            logger.warning("Scaler feature names mismatch: expected %s, got %s", expected_features, scaler_features)

        self.model_info = {
            "model_type": "LogisticRegression",
            "model_identifier": "Cleveland_LogReg_v1.0",
            "scaler_type": type(self.scaler).__name__,
            "expected_feature_count": 13,
            "feature_order": expected_features,
            "classes": [int(c) for c in getattr(self.logistic_model, "classes_", [0, 1])],
            "random_forest_available": self.random_forest_model is not None,
        }
        self.is_loaded = True

    def get_scaler_and_model(self) -> Tuple[Any, Any]:
        if not self.is_loaded:
            self.load_artifacts()
        return self.scaler, self.logistic_model
