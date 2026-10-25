import logging
from typing import Dict, Any, Tuple
from .model_loader import ModelLoader
from .feature_mapper import prepare_feature_vector

logger = logging.getLogger("cardiocheck.predictor")

class PredictorService:
    def __init__(self):
        self.model_loader = ModelLoader.get_instance()

    def run_prediction(self, features_dict: Dict[str, Any]) -> Tuple[int, float, float, str, str]:
        """
        Runs the Logistic Regression model using the exact training feature order and scaler.
        Returns:
            (classification_class, prob_class_0, prob_class_1, model_identifier, explanation)
        """
        scaler, model = self.model_loader.get_scaler_and_model()

        # Prepare vector in exact 13-feature training order
        raw_vector, mapped_dict = prepare_feature_vector(features_dict)

        # Scale features
        scaled_vector = scaler.transform(raw_vector)

        # Predict with Logistic Regression
        prediction_arr = model.predict(scaled_vector)
        pred_class = int(prediction_arr[0])

        if pred_class not in [0, 1]:
            raise ValueError(f"Model returned invalid class: {pred_class}. Expected 0 or 1.")

        # Predict probability if available
        prob_0, prob_1 = 0.5, 0.5
        if hasattr(model, "predict_proba"):
            probs = model.predict_proba(scaled_vector)[0]
            prob_0 = float(probs[0])
            prob_1 = float(probs[1])

        # Clinical explanation matching locked specification
        if pred_class == 1:
            explanation = (
                "The submitted clinical features were classified into the heart-disease-present category "
                "(Cleveland dataset diagnostic threshold ≥ 50% diameter narrowing)."
            )
        else:
            explanation = (
                "The submitted clinical features were classified into the no-heart-disease category "
                "(absence of significant coronary artery diameter narrowing within Cleveland dataset thresholds)."
            )

        model_id = self.model_loader.model_info.get("model_identifier", "Cleveland_LogReg_v1.0")

        return pred_class, prob_0, prob_1, model_id, explanation

predictor_service = PredictorService()
