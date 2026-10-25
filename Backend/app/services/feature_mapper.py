import numpy as np
from typing import Dict, Any, Tuple

# Exact training order required by the saved scaler
FEATURE_NAMES = [
    "age",
    "sex",
    "cp",
    "trestbps",
    "chol",
    "fbs",
    "restecg",
    "thalach",
    "exang",
    "oldpeak",
    "slope",
    "ca",
    "thal",
]

def map_categorical_features(raw_features: Dict[str, Any]) -> Dict[str, float]:
    """
    Maps incoming frontend features to the canonical UCI Cleveland training codes
    expected by the saved scaler.
    """
    mapped = {}

    # 1. age: float
    mapped["age"] = float(raw_features["age"])

    # 2. sex: 0 (Female), 1 (Male)
    mapped["sex"] = float(int(raw_features["sex"]))

    # 3. cp (Chest pain type):
    # Form: 0: Typical, 1: Atypical, 2: Non-Anginal, 3: Asymptomatic
    # UCI:  1: Typical, 2: Atypical, 3: Non-Anginal, 4: Asymptomatic
    cp_val = int(raw_features["cp"])
    if cp_val in [0, 1, 2, 3]:
        mapped["cp"] = float(cp_val + 1)
    elif cp_val in [1, 2, 3, 4]:
        mapped["cp"] = float(cp_val)
    else:
        raise ValueError(f"Invalid cp value: {cp_val}")

    # 4. trestbps: float
    mapped["trestbps"] = float(raw_features["trestbps"])

    # 5. chol: float
    mapped["chol"] = float(raw_features["chol"])

    # 6. fbs: 0 (<=120), 1 (>120)
    mapped["fbs"] = float(int(raw_features["fbs"]))

    # 7. restecg: 0 (Normal), 1 (ST-T abn), 2 (LVH)
    mapped["restecg"] = float(int(raw_features["restecg"]))

    # 8. thalach: float
    mapped["thalach"] = float(raw_features["thalach"])

    # 9. exang: 0 (No), 1 (Yes)
    mapped["exang"] = float(int(raw_features["exang"]))

    # 10. oldpeak: float
    mapped["oldpeak"] = float(raw_features["oldpeak"])

    # 11. slope (ST segment slope):
    # Form: 0: Upsloping, 1: Flat, 2: Downsloping
    # UCI:  1: Upsloping, 2: Flat, 3: Downsloping
    slope_val = int(raw_features["slope"])
    if slope_val in [0, 1, 2]:
        mapped["slope"] = float(slope_val + 1)
    elif slope_val in [1, 2, 3]:
        mapped["slope"] = float(slope_val)
    else:
        raise ValueError(f"Invalid slope value: {slope_val}")

    # 12. ca: 0..3 (major vessels)
    mapped["ca"] = float(raw_features["ca"])

    # 13. thal (Thalassemia scintigraphy):
    # Form: 1: Normal, 2: Reversible Defect, 3: Fixed Defect
    # UCI:  3: Normal, 7: Reversible Defect, 6: Fixed Defect
    thal_val = int(raw_features["thal"])
    if thal_val == 1:
        mapped["thal"] = 3.0  # Normal
    elif thal_val == 2:
        mapped["thal"] = 7.0  # Reversible defect
    elif thal_val == 3:
        mapped["thal"] = 6.0  # Fixed defect
    elif thal_val in [3, 6, 7]:
        mapped["thal"] = float(thal_val)
    else:
        raise ValueError(f"Invalid thal value: {thal_val}")

    return mapped

def prepare_feature_vector(raw_features: Dict[str, Any]) -> Tuple[np.ndarray, Dict[str, float]]:
    """
    Transforms raw features into a numpy array of shape (1, 13) in exact training order.
    Returns (numpy_vector, mapped_dict).
    """
    mapped = map_categorical_features(raw_features)
    vector = np.array([[mapped[k] for k in FEATURE_NAMES]], dtype=float)
    return vector, mapped

def format_features_for_display(features: Dict[str, Any]) -> Dict[str, str]:
    """Provides human-readable clinical labels for the 13 features."""
    sex_str = "Female" if int(features.get("sex", 0)) == 0 else "Male"
    
    cp_map = {
        0: "Typical Angina",
        1: "Atypical Angina",
        2: "Non-Anginal Chest Pain",
        3: "Asymptomatic",
        4: "Asymptomatic"
    }
    cp_val = int(features.get("cp", 0))
    # If 1-based UCI code passed
    if cp_val in [1, 2, 3, 4] and "cp_is_uci" in features:
        cp_map_uci = {1: "Typical Angina", 2: "Atypical Angina", 3: "Non-Anginal", 4: "Asymptomatic"}
        cp_str = cp_map_uci.get(cp_val, str(cp_val))
    else:
        cp_str = cp_map.get(cp_val, "Atypical Angina")

    fbs_str = "≤ 120 mg/dL (Normal)" if int(features.get("fbs", 0)) == 0 else "> 120 mg/dL (Elevated)"
    
    ecg_map = {
        0: "Normal Baseline Trace",
        1: "ST-T Wave Abnormality",
        2: "Left Ventricular Hypertrophy"
    }
    ecg_str = ecg_map.get(int(features.get("restecg", 0)), "Normal Baseline Trace")
    
    exang_str = "Yes" if int(features.get("exang", 0)) == 1 else "No"
    
    slope_map = {
        0: "Upsloping",
        1: "Flat",
        2: "Downsloping (High Risk)",
        3: "Downsloping (High Risk)"
    }
    slope_str = slope_map.get(int(features.get("slope", 0)), "Flat")

    ca_val = int(float(features.get("ca", 0)))
    ca_str = f"{ca_val} major vessel{'s' if ca_val != 1 else ''}"

    thal_map = {
        1: "Normal Blood Flow",
        2: "Reversible Defect (Ischemia)",
        3: "Fixed Defect (Infarct)",
        6: "Fixed Defect (Infarct)",
        7: "Reversible Defect (Ischemia)"
    }
    thal_str = thal_map.get(int(features.get("thal", 1)), "Normal Blood Flow")

    return {
        "Age": f"{features.get('age', '--')} years",
        "Sex": sex_str,
        "Chest Pain Type": cp_str,
        "Resting Blood Pressure": f"{features.get('trestbps', '--')} mm Hg",
        "Serum Cholesterol": f"{features.get('chol', '--')} mg/dL",
        "Fasting Blood Sugar": fbs_str,
        "Resting ECG": ecg_str,
        "Maximum Heart Rate": f"{features.get('thalach', '--')} bpm",
        "Exercise-Induced Angina": exang_str,
        "ST Depression": f"{features.get('oldpeak', '--')} mm",
        "Peak ST Slope": slope_str,
        "Major Vessels (Fluoroscopy)": ca_str,
        "Thalassemia Scintigraphy": thal_str,
    }
