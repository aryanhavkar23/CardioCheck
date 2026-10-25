import json
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ..database import get_db
from ..models.user import User
from ..models.patient import Patient
from ..models.assessment import Assessment
from ..schemas.assessment import (
    AssessmentFeaturesInput,
    AssessmentDraftInput,
    AssessmentNotesUpdate,
    AssessmentOut,
    AssessmentCompareOut
)
from ..services.predictor import predictor_service
from ..services.audit_service import generate_assessment_reference, calculate_biomarker_variance
from ..services.feature_mapper import format_features_for_display
from .auth import get_current_user

router = APIRouter(prefix="/api/assessments", tags=["Assessments"])

@router.post("/{patient_id}/predict", status_code=status.HTTP_201_CREATED)
def predict_and_create_assessment(
    patient_id: int,
    features_in: AssessmentFeaturesInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Authorize patient
    patient = db.query(Patient).filter(Patient.id == patient_id, Patient.doctor_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient record not found or unauthorized.")

    # 2. Extract and preserve snapshot of all 13 features
    raw_features = features_in.model_dump()

    # 3. Run inference with scaler and Logistic Regression model
    try:
        pred_class, prob_0, prob_1, model_id, explanation = predictor_service.run_prediction(raw_features)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Model inference failed: {str(e)}")

    # 4. Generate stable reference ID
    total_count = db.query(Assessment).count()
    reference_id = generate_assessment_reference(total_count)

    # 5. Persist immutable assessment record
    assessment = Assessment(
        reference_id=reference_id,
        patient_id=patient.id,
        doctor_id=current_user.id,
        status="pending",  # Pending doctor review and notes
        age=raw_features["age"],
        sex=raw_features["sex"],
        cp=raw_features["cp"],
        trestbps=raw_features["trestbps"],
        chol=raw_features["chol"],
        fbs=raw_features["fbs"],
        restecg=raw_features["restecg"],
        thalach=raw_features["thalach"],
        exang=raw_features["exang"],
        oldpeak=raw_features["oldpeak"],
        slope=raw_features["slope"],
        ca=raw_features["ca"],
        thal=raw_features["thal"],
        input_snapshot_json=json.dumps(raw_features),
        prediction=pred_class,
        probability_class_0=prob_0,
        probability_class_1=prob_1,
        model_identifier=model_id,
        explanation=explanation,
        recommended_protocol="Coronary CTA + Triage in 14d" if pred_class == 1 else "Standard Outpatient Protocol",
        follow_up_text="In 2 Weeks" if pred_class == 1 else "In 6 Months",
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    # Update patient timestamp without modifying historical data
    patient.updated_at = datetime.now(timezone.utc)
    db.commit()

    return {
        "assessment_id": assessment.id,
        "reference_id": assessment.reference_id,
        "patient_id": patient.id,
        "patient_name": patient.name,
        "patient_mrn": patient.mrn,
        "timestamp": assessment.created_at.strftime("%b %d, %Y at %H:%M EDT"),
        "created_at": assessment.created_at.isoformat(),
        "prediction": pred_class,
        "classification_label": "Class 1: Heart Disease Category Present" if pred_class == 1 else "Class 0: No Heart Disease Category",
        "probability_class_0": prob_0,
        "probability_class_1": prob_1,
        "explanation": explanation,
        "model_identifier": model_id,
        "status": assessment.status,
        "features": raw_features,
        "display_features": format_features_for_display(raw_features),
        "disclaimer": "This statistical model result is not a confirmed medical diagnosis. Decision support output must be corroborated with primary physician evaluation."
    }

@router.get("/{assessment_id}")
def get_assessment(
    assessment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id, Assessment.doctor_id == current_user.id).first()
    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found or unauthorized.")

    p = assessment.patient
    features_dict = assessment.get_features_dict()

    return {
        "id": assessment.id,
        "reference_id": assessment.reference_id,
        "patient_id": assessment.patient_id,
        "patient_name": p.name if p else "Unknown",
        "patient_mrn": p.mrn if p else "Unknown",
        "status": assessment.status,
        "created_at": assessment.created_at.isoformat(),
        "formatted_date": assessment.created_at.strftime("%b %d, %Y at %H:%M EDT"),
        "prediction": assessment.prediction,
        "classification_label": "Class 1: Heart Disease Category Present" if assessment.prediction == 1 else "Class 0: No Heart Disease Category",
        "probability_class_0": assessment.probability_class_0,
        "probability_class_1": assessment.probability_class_1,
        "model_identifier": assessment.model_identifier,
        "explanation": assessment.explanation,
        "features": features_dict,
        "display_features": format_features_for_display(features_dict),
        "doctor_notes": assessment.doctor_notes,
        "recommended_protocol": assessment.recommended_protocol,
        "follow_up_text": assessment.follow_up_text,
        "reviewed_at": assessment.reviewed_at.isoformat() if assessment.reviewed_at else None,
        "report_generated_at": assessment.report_generated_at.isoformat() if assessment.report_generated_at else None,
        "disclaimer": "This statistical model result is not a confirmed medical diagnosis."
    }

@router.patch("/{assessment_id}/notes")
def update_assessment_notes(
    assessment_id: int,
    notes_in: AssessmentNotesUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id, Assessment.doctor_id == current_user.id).first()
    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found or unauthorized.")

    if notes_in.doctor_notes is not None:
        assessment.doctor_notes = notes_in.doctor_notes
    if notes_in.recommended_protocol is not None:
        assessment.recommended_protocol = notes_in.recommended_protocol
    if notes_in.follow_up_text is not None:
        assessment.follow_up_text = notes_in.follow_up_text
    
    assessment.status = notes_in.status or "reviewed"
    assessment.reviewed_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(assessment)

    return {
        "message": "Doctor notes and clinical protocol updated successfully.",
        "assessment_id": assessment.id,
        "status": assessment.status,
        "doctor_notes": assessment.doctor_notes,
        "reviewed_at": assessment.reviewed_at.isoformat()
    }

@router.patch("/{assessment_id}/draft")
def update_draft(
    assessment_id: int,
    draft_in: AssessmentDraftInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    assessment = db.query(Assessment).filter(
        Assessment.id == assessment_id,
        Assessment.doctor_id == current_user.id,
        Assessment.status == "draft"
    ).first()
    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment draft not found.")

    update_dict = draft_in.model_dump(exclude_unset=True)
    current_dict = assessment.get_features_dict()
    current_dict.update(update_dict)

    for k, v in update_dict.items():
        if hasattr(assessment, k):
            setattr(assessment, k, v)

    assessment.input_snapshot_json = json.dumps(current_dict)
    db.commit()
    db.refresh(assessment)

    return {"message": "Draft updated.", "assessment_id": assessment.id}

@router.get("/compare/{patient_id}")
def compare_patient_assessments(
    patient_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.id == patient_id, Patient.doctor_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient record not found.")

    assessments = db.query(Assessment).filter(
        Assessment.patient_id == patient_id,
        Assessment.prediction.isnot(None)
    ).order_by(desc(Assessment.created_at)).all()

    if len(assessments) < 1:
        return {"patient_id": patient_id, "patient_name": patient.name, "assessments": [], "variance": {}}

    latest = assessments[0]
    previous = assessments[1] if len(assessments) > 1 else assessments[0]

    variance = calculate_biomarker_variance(previous.get_features_dict(), latest.get_features_dict())

    return {
        "patient_id": patient.id,
        "patient_name": patient.name,
        "patient_mrn": patient.mrn,
        "latest_assessment_id": latest.reference_id,
        "latest_date": latest.created_at.strftime("%b %d, %Y"),
        "previous_assessment_id": previous.reference_id,
        "previous_date": previous.created_at.strftime("%b %d, %Y"),
        "variance": variance,
        "historical_count": len(assessments)
    }
