import json
from datetime import datetime, timedelta, timezone
from .database import engine, SessionLocal, Base
from .models.user import User
from .models.patient import Patient
from .models.assessment import Assessment
from .routers.auth import hash_password
from .services.predictor import predictor_service

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Dr. Sarah Jenkins
        email = "doctor@cardiocheck.io"
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(
                email=email,
                hashed_password=hash_password("CardioCheck2026!"),
                full_name="Dr. Sarah Jenkins, MD",
                department="Cardiology Dept",
                license_number="MD-98241-OH"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"Seeded demo doctor: {user.email}")
        else:
            print(f"Doctor {email} already exists.")

        # 2. Seed Patient Eleanor Vance (PT-8821)
        patient = db.query(Patient).filter(Patient.mrn == "PT-8821", Patient.doctor_id == user.id).first()
        if not patient:
            patient = Patient(
                doctor_id=user.id,
                mrn="PT-8821",
                name="Eleanor Vance",
                dob="1962-03-14",
                age=62,
                sex=0,  # Female
                blood_group="A+",
                ward="West Pavilion 4B",
                protocol="Coronary Artery Disease Comprehensive Risk Workup",
                emergency_contact_name="Marcus Vance (Spouse)",
                emergency_contact_phone="+1 (555) 019-8831",
                consent_status="Signed Oct 12, 2024 (Active)",
                allergies="Penicillin, Contrast Dye (Mild)",
                avatar_url="https://lh3.googleusercontent.com/aida-public/AB6AXuAtfjX0xFw2R6rtBIXXa4pG8HPKNig3OC-DchKxcvIbpYAwmG_5uA7PRY27p4a85hNKvZG1uZ5IDj9ns8oMg6kPRIA7i0ej9sN45nWLWJaAhordd01CPF1iOspflUvCl06-ZeT0tGRsAbRXNVkcUYyy20Wew8yTR1Tm609AWK7UqjlrXG0hKRLwt3bM3aZChPADz9HFjPpt8Y6qEZa1cAMC7sI7FwIx2Tous61FeReW_oiNI2SbNzfx"
            )
            db.add(patient)
            db.commit()
            db.refresh(patient)
            print("Seeded Eleanor Vance (PT-8821).")

            # 3. Seed Eleanor Vance Historical Assessments
            # Assessment 3: Jan 10, 2024 (Baseline Intake - Class 0)
            f_jan = {"age": 61, "sex": 0, "cp": 1, "trestbps": 128, "chol": 230, "fbs": 0, "restecg": 0, "thalach": 170, "exang": 0, "oldpeak": 1.2, "slope": 0, "ca": 0, "thal": 1}
            p_jan, pr0_jan, pr1_jan, m_jan, exp_jan = predictor_service.run_prediction(f_jan)
            a_jan = Assessment(
                reference_id="ASM-2024-0044",
                patient_id=patient.id,
                doctor_id=user.id,
                status="reviewed",
                created_at=datetime(2024, 1, 10, 10, 30, tzinfo=timezone.utc),
                input_snapshot_json=json.dumps(f_jan),
                prediction=p_jan,
                probability_class_0=pr0_jan,
                probability_class_1=pr1_jan,
                model_identifier=m_jan,
                explanation=exp_jan,
                doctor_notes="Baseline clinical intake. Normal myocardial perfusion. Stable vitals.",
                recommended_protocol="Standard Outpatient Protocol",
                follow_up_text="Completed",
                reviewed_at=datetime(2024, 1, 10, 11, 0, tzinfo=timezone.utc),
                **f_jan
            )
            db.add(a_jan)

            # Assessment 2: Jun 15, 2024 (Semi-Annual Check - Class 0)
            f_jun = {"age": 62, "sex": 0, "cp": 1, "trestbps": 132, "chol": 242, "fbs": 0, "restecg": 0, "thalach": 165, "exang": 0, "oldpeak": 1.8, "slope": 1, "ca": 0, "thal": 1}
            p_jun, pr0_jun, pr1_jun, m_jun, exp_jun = predictor_service.run_prediction(f_jun)
            a_jun = Assessment(
                reference_id="ASM-2024-0541",
                patient_id=patient.id,
                doctor_id=user.id,
                status="reviewed",
                created_at=datetime(2024, 6, 15, 14, 0, tzinfo=timezone.utc),
                input_snapshot_json=json.dumps(f_jun),
                prediction=p_jun,
                probability_class_0=pr0_jun,
                probability_class_1=pr1_jun,
                model_identifier=m_jun,
                explanation=exp_jun,
                doctor_notes="Routine 6-month evaluation. Patient asymptomatic during baseline testing. Continue routine diet.",
                recommended_protocol="Routine CAD Monitoring",
                follow_up_text="Completed",
                reviewed_at=datetime(2024, 6, 15, 14, 30, tzinfo=timezone.utc),
                **f_jun
            )
            db.add(a_jun)

            # Assessment 1: Oct 24, 2024 (Latest - Class 1 Present)
            f_oct = {"age": 62, "sex": 0, "cp": 1, "trestbps": 140, "chol": 268, "fbs": 0, "restecg": 1, "thalach": 160, "exang": 1, "oldpeak": 3.6, "slope": 2, "ca": 2, "thal": 2}
            p_oct, pr0_oct, pr1_oct, m_oct, exp_oct = predictor_service.run_prediction(f_oct)
            a_oct = Assessment(
                reference_id="ASM-2024-0982",
                patient_id=patient.id,
                doctor_id=user.id,
                status="reviewed",
                created_at=datetime(2024, 10, 24, 14, 15, tzinfo=timezone.utc),
                input_snapshot_json=json.dumps(f_oct),
                prediction=p_oct,
                probability_class_0=pr0_oct,
                probability_class_1=pr1_oct,
                model_identifier=m_oct,
                explanation=exp_oct,
                doctor_notes="Patient presents with atypical angina alongside marked ST depression (3.6mm) on resting ECG. Recommend urgent outpatient coronary CT angiography and direct cardiology consult within 48h.",
                recommended_protocol="Coronary CTA + Triage In 14d",
                follow_up_text="In 2 Weeks",
                reviewed_at=datetime(2024, 10, 24, 14, 38, tzinfo=timezone.utc),
                **f_oct
            )
            db.add(a_oct)
            db.commit()
            print("Seeded historical assessments for Eleanor Vance.")

        # 4. Seed other queue demo patients if not present
        demo_queue = [
            ("PT-8822", "Robert Kowalski", 58, 1, "B+", "West Pavilion 3A", {"age": 58, "sex": 1, "cp": 2, "trestbps": 138, "chol": 250, "fbs": 0, "restecg": 0, "thalach": 145, "exang": 1, "oldpeak": 1.4, "slope": 1, "ca": 1, "thal": 2}),
            ("PT-8823", "Marcus Sterling", 67, 1, "O+", "ICU Ward 2", {"age": 67, "sex": 1, "cp": 0, "trestbps": 160, "chol": 286, "fbs": 1, "restecg": 2, "thalach": 120, "exang": 1, "oldpeak": 2.8, "slope": 2, "ca": 3, "thal": 3}),
            ("PT-8824", "Claire Henderson", 54, 0, "A-", "Outpatient Ward", {"age": 54, "sex": 0, "cp": 2, "trestbps": 120, "chol": 210, "fbs": 0, "restecg": 0, "thalach": 168, "exang": 0, "oldpeak": 0.2, "slope": 0, "ca": 0, "thal": 1}),
            ("PT-8825", "Anthony Ruiz", 71, 1, "AB+", "Telemetry 4B", {"age": 71, "sex": 1, "cp": 3, "trestbps": 145, "chol": 275, "fbs": 0, "restecg": 1, "thalach": 130, "exang": 0, "oldpeak": 2.1, "slope": 1, "ca": 2, "thal": 2}),
        ]
        seq_idx = 1001
        for mrn, name, age, sex, bg, ward, f_data in demo_queue:
            q_pat = db.query(Patient).filter(Patient.mrn == mrn, Patient.doctor_id == user.id).first()
            if not q_pat:
                q_pat = Patient(
                    doctor_id=user.id,
                    mrn=mrn,
                    name=name,
                    age=age,
                    sex=sex,
                    blood_group=bg,
                    ward=ward,
                )
                db.add(q_pat)
                db.commit()
                db.refresh(q_pat)

                pred, p0, p1, m_id, exp = predictor_service.run_prediction(f_data)
                q_ass = Assessment(
                    reference_id=f"ASM-2024-{seq_idx:04d}",
                    patient_id=q_pat.id,
                    doctor_id=user.id,
                    status="pending" if pred == 1 else "reviewed",
                    input_snapshot_json=json.dumps(f_data),
                    prediction=pred,
                    probability_class_0=p0,
                    probability_class_1=p1,
                    model_identifier=m_id,
                    explanation=exp,
                    doctor_notes="Initial intake evaluation pending specialist review." if pred == 1 else "Routine monitoring.",
                    follow_up_text="Requires Action" if pred == 1 else "Routine",
                    **f_data
                )
                db.add(q_ass)
                db.commit()
                seq_idx += 1

        print("Database seed completed successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
