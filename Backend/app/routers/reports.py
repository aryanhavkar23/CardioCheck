from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..models.assessment import Assessment
from ..services.report_service import generate_assessment_pdf
from .auth import get_current_user

router = APIRouter(prefix="/api/assessments", tags=["Reports"])

@router.get("/{assessment_id}/report")
def download_assessment_report(
    assessment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Authorize assessment
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id, Assessment.doctor_id == current_user.id).first()
    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment record not found or unauthorized.")

    patient = assessment.patient
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Associated patient record not found.")

    # 2. Generate PDF using immutable assessment snapshot
    try:
        pdf_stream = generate_assessment_pdf(patient, assessment, current_user)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to generate clinical report: {e}")

    # 3. Update report generation timestamp
    assessment.report_generated_at = datetime.now(timezone.utc)
    db.commit()

    filename = f"{assessment.reference_id}_CardioCheck_Report.pdf"
    return Response(
        content=pdf_stream.getvalue(),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"inline; filename={filename}",
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )
