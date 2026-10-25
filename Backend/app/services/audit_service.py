import random
from datetime import datetime, timezone
from typing import Dict, Any, Optional

def generate_patient_mrn(existing_count: int = 0) -> str:
    """Generates stable MRN reference like PT-8821."""
    num = 8820 + existing_count + random.randint(1, 99)
    return f"PT-{num}"

def generate_assessment_reference(existing_count: int = 0) -> str:
    """Generates stable assessment reference like ASM-2024-0982."""
    year = datetime.now(timezone.utc).year
    seq = 980 + existing_count + random.randint(1, 50)
    return f"ASM-{year}-{seq:04d}"

def calculate_biomarker_variance(old_features: Dict[str, Any], new_features: Dict[str, Any]) -> Dict[str, Any]:
    """
    Computes variance delta and vector shifts between two assessment snapshots.
    """
    variance = {}

    # Numeric deltas
    for key, unit in [
        ("trestbps", "mmHg"),
        ("chol", "mg/dL"),
        ("oldpeak", "mm"),
        ("thalach", "bpm"),
        ("ca", "vessel")
    ]:
        v_old = old_features.get(key)
        v_new = new_features.get(key)
        if v_old is not None and v_new is not None:
            try:
                f_old = float(v_old)
                f_new = float(v_new)
                diff = round(f_new - f_old, 2)
                variance[key] = {
                    "old": f_old,
                    "new": f_new,
                    "diff": diff,
                    "unit": unit,
                    "direction": "up" if diff > 0 else ("down" if diff < 0 else "neutral")
                }
            except Exception:
                pass

    return variance
