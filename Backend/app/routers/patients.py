import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ..database import get_db
from ..models.user import User
from ..models.patient import Patient
from ..models.assessment import Assessment
from ..schemas.patient import PatientCreate, PatientUpdate, PatientOut
from ..schemas.assessment import AssessmentDraftInput, AssessmentOut
from ..services.audit_service import generate_patient_mrn, generate_assessment_reference
from .auth import get_current_user

router = APIRouter(prefix="/api/patients", tags=["Patients"])

@router.get("", response_model=List[PatientOut])
def list_patients(
    search: Optional[str] = Query(None, description="Search by MRN or Name"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Patient).filter(Patient.doctor_id == current_user.id)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter((Patient.name.ilike(s)) | (Patient.mrn.ilike(s)))
    
    patients = query.order_by(desc(Patient.updated_at)).all()
    results = []
    for p in patients:
        latest = p.assessments[0] if p.assessments else None
        p_dict = {
            "id": p.id,
            "doctor_id": p.doctor_id,
            "mrn": p.mrn,
            "name": p.name,
            "dob": p.dob,
            "age": p.age,
            "sex": p.sex,
            "blood_group": p.blood_group,
            "ward": p.ward,
            "protocol": p.protocol,
            "emergency_contact_name": p.emergency_contact_name,
            "emergency_contact_phone": p.emergency_contact_phone,
            "consent_status": p.consent_status,
            "allergies": p.allergies,
            "avatar_url": p.avatar_url,
            "created_at": p.created_at,
            "updated_at": p.updated_at,
            "latest_assessment_id": latest.reference_id if latest else None,
            "latest_classification": latest.prediction if latest else None,
            "latest_assessment_date": latest.created_at.strftime("%b %d, %Y") if latest else None,
            "review_status": latest.status if latest else "No Assessments",
        }
        results.append(PatientOut(**p_dict))
    return results

@router.post("", response_model=PatientOut, status_code=status.HTTP_201_CREATED)
def create_patient(
    patient_in: PatientCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Auto-generate MRN if not provided
    mrn = patient_in.mrn
    if not mrn or not mrn.strip():
        count = db.query(Patient).filter(Patient.doctor_id == current_user.id).count()
        mrn = generate_patient_mrn(count)

    new_patient = Patient(
        doctor_id=current_user.id,
        mrn=mrn,
        name=patient_in.name,
        dob=patient_in.dob or "1970-01-01",
        age=patient_in.age,
        sex=patient_in.sex,
        blood_group=patient_in.blood_group or "A+",
        ward=patient_in.ward or "West Pavilion 4B",
        protocol=patient_in.protocol or "Coronary Artery Disease Comprehensive Risk Workup",
        emergency_contact_name=patient_in.emergency_contact_name,
        emergency_contact_phone=patient_in.emergency_contact_phone,
        consent_status=patient_in.consent_status or "Signed (Active)",
        allergies=patient_in.allergies or "None Reported",
        avatar_url=patient_in.avatar_url,
    )
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)

    return PatientOut(
        id=new_patient.id,
        doctor_id=new_patient.doctor_id,
        mrn=new_patient.mrn,
        name=new_patient.name,
        dob=new_patient.dob,
        age=new_patient.age,
        sex=new_patient.sex,
        blood_group=new_patient.blood_group,
        ward=new_patient.ward,
        protocol=new_patient.protocol,
        emergency_contact_name=new_patient.emergency_contact_name,
        emergency_contact_phone=new_patient.emergency_contact_phone,
        consent_status=new_patient.consent_status,
        allergies=new_patient.allergies,
        avatar_url=new_patient.avatar_url,
        created_at=new_patient.created_at,
        updated_at=new_patient.updated_at,
        latest_assessment_id=None,
        latest_classification=None,
        latest_assessment_date=None,
        review_status="No Assessments"
    )

@router.get("/{patient_id}", response_model=PatientOut)
def get_patient(
    patient_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.id == patient_id, Patient.doctor_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient record not found.")

    latest = patient.assessments[0] if patient.assessments else None
    return PatientOut(
        id=patient.id,
        doctor_id=patient.doctor_id,
        mrn=patient.mrn,
        name=patient.name,
        dob=patient.dob,
        age=patient.age,
        sex=patient.sex,
        blood_group=patient.blood_group,
        ward=patient.ward,
        protocol=patient.protocol,
        emergency_contact_name=patient.emergency_contact_name,
        emergency_contact_phone=patient.emergency_contact_phone,
        consent_status=patient.consent_status,
        allergies=patient.allergies,
        avatar_url=patient.avatar_url,
        created_at=patient.created_at,
        updated_at=patient.updated_at,
        latest_assessment_id=latest.reference_id if latest else None,
        latest_classification=latest.prediction if latest else None,
        latest_assessment_date=latest.created_at.strftime("%b %d, %Y") if latest else None,
        review_status=latest.status if latest else "No Assessments",
    )

@router.patch("/{patient_id}", response_model=PatientOut)
def update_patient(
    patient_id: int,
    patient_in: PatientUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.id == patient_id, Patient.doctor_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient record not found.")

    # Update only provided fields; historical assessments are NOT modified
    update_data = patient_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(patient, field, val)

    db.commit()
    db.refresh(patient)

    latest = patient.assessments[0] if patient.assessments else None
    return PatientOut(
        id=patient.id,
        doctor_id=patient.doctor_id,
        mrn=patient.mrn,
        name=patient.name,
        dob=patient.dob,
        age=patient.age,
        sex=patient.sex,
        blood_group=patient.blood_group,
        ward=patient.ward,
        protocol=patient.protocol,
        emergency_contact_name=patient.emergency_contact_name,
        emergency_contact_phone=patient.emergency_contact_phone,
        consent_status=patient.consent_status,
        allergies=patient.allergies,
        avatar_url=patient.avatar_url,
        created_at=patient.created_at,
        updated_at=patient.updated_at,
        latest_assessment_id=latest.reference_id if latest else None,
        latest_classification=latest.prediction if latest else None,
        latest_assessment_date=latest.created_at.strftime("%b %d, %Y") if latest else None,
        review_status=latest.status if latest else "No Assessments",
    )

@router.get("/{patient_id}/assessments")
def get_patient_assessments(
    patient_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.id == patient_id, Patient.doctor_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient record not found.")

    assessments = db.query(Assessment).filter(Assessment.patient_id == patient_id).order_by(desc(Assessment.created_at)).all()
    results = []
    for a in assessments:
        results.append({
            "id": a.id,
            "reference_id": a.reference_id,
            "patient_id": a.patient_id,
            "doctor_id": a.doctor_id,
            "status": a.status,
            "created_at": a.created_at.isoformat(),
            "formatted_date": a.created_at.strftime("%b %d, %Y • %H:%M EDT"),
            "features": a.get_features_dict(),
            "prediction": a.prediction,
            "probability_class_0": a.probability_class_0,
            "probability_class_1": a.probability_class_1,
            "model_identifier": a.model_identifier,
            "explanation": a.explanation,
            "doctor_notes": a.doctor_notes,
            "recommended_protocol": a.recommended_protocol,
            "follow_up_text": a.follow_up_text,
            "reviewed_at": a.reviewed_at.isoformat() if a.reviewed_at else None,
            "report_generated_at": a.report_generated_at.isoformat() if a.report_generated_at else None,
        })
    return results

@router.post("/{patient_id}/assessments/drafts")
def save_assessment_draft(
    patient_id: int,
    draft_in: AssessmentDraftInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.id == patient_id, Patient.doctor_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient record not found.")

    ref_id = generate_assessment_reference(db.query(Assessment).count())
    raw_dict = draft_in.model_dump(exclude_unset=True)

    assessment = Assessment(
        reference_id=ref_id,
        patient_id=patient_id,
        doctor_id=current_user.id,
        status="draft",
        age=raw_dict.get("age"),
        sex=raw_dict.get("sex"),
        cp=raw_dict.get("cp"),
        trestbps=raw_dict.get("trestbps"),
        chol=raw_dict.get("chol"),
        fbs=raw_dict.get("fbs"),
        restecg=raw_dict.get("restecg"),
        thalach=raw_dict.get("thalach"),
        exang=raw_dict.get("exang"),
        oldpeak=raw_dict.get("oldpeak"),
        slope=raw_dict.get("slope"),
        ca=raw_dict.get("ca"),
        thal=raw_dict.get("thal"),
        input_snapshot_json=json.dumps(raw_dict),
        doctor_notes=draft_in.doctor_notes,
        recommended_protocol=draft_in.recommended_protocol,
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    return {
        "message": "Assessment draft saved successfully.",
        "assessment_id": assessment.id,
        "reference_id": assessment.reference_id,
        "status": assessment.status
    }
