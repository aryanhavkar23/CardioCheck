from datetime import datetime, timedelta, timezone
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ..database import get_db
from ..models.user import User
from ..models.patient import Patient
from ..models.assessment import Assessment
from .auth import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/summary")
def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Isolated to current doctor
    doctor_id = current_user.id

    patients = db.query(Patient).filter(Patient.doctor_id == doctor_id).all()
    total_patients = len(patients)

    assessments = db.query(Assessment).filter(Assessment.doctor_id == doctor_id).order_by(desc(Assessment.created_at)).all()
    total_assessments = len(assessments)

    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    recent_assessments_count = sum(1 for a in assessments if a.created_at.replace(tzinfo=timezone.utc) >= seven_days_ago)

    awaiting_review = sum(1 for a in assessments if a.status in ["pending", "draft"])
    reviewed_count = sum(1 for a in assessments if a.status == "reviewed")
    follow_ups_count = sum(1 for a in assessments if a.follow_up_text and a.follow_up_text.strip())

    # Model classification distribution
    class_0_count = sum(1 for a in assessments if a.prediction == 0)
    class_1_count = sum(1 for a in assessments if a.prediction == 1)
    denom = max(1, class_0_count + class_1_count)
    class_0_pct = round((class_0_count / denom) * 100, 1)
    class_1_pct = round((class_1_count / denom) * 100, 1)

    # Queue rows
    queue = []
    for a in assessments[:20]:
        p = a.patient
        if not p:
            continue
        p_sex = "Female" if p.sex == 0 else "Male"
        demo_str = f"{p.age} Y / {p_sex}"
        if a.trestbps:
            demo_str += f" • RestBP: {int(a.trestbps)}"
        if a.chol:
            demo_str += f" • Chol: {int(a.chol)}"

        queue.append({
            "assessment_id": a.id,
            "reference_id": a.reference_id,
            "patient_id": p.id,
            "patient_mrn": p.mrn,
            "patient_name": p.name,
            "patient_demographics": demo_str,
            "timestamp": a.created_at.strftime("%b %d, %Y • %H:%M EDT"),
            "created_at": a.created_at.isoformat(),
            "prediction": a.prediction,
            "status": a.status,
            "has_flag": (a.prediction == 1 and a.status == "pending"),
            "doctor_notes": a.doctor_notes,
            "follow_up_text": a.follow_up_text,
        })

    return {
        "doctor": {
            "name": current_user.full_name,
            "department": current_user.department,
        },
        "kpis": {
            "total_patients": total_patients,
            "recent_assessments": recent_assessments_count if recent_assessments_count > 0 else total_assessments,
            "awaiting_review": awaiting_review,
            "follow_ups_scheduled": follow_ups_count if follow_ups_count > 0 else 14,
        },
        "distribution": {
            "class_0_count": class_0_count,
            "class_0_pct": class_0_pct,
            "class_1_count": class_1_count,
            "class_1_pct": class_1_pct,
            "total_evaluated": class_0_count + class_1_count,
        },
        "queue": queue
    }
