import pytest

# Complete valid 13-feature payloads
VALID_CLASS_1_FEATURES = {
    "age": 62.0,
    "sex": 0,
    "cp": 1,
    "trestbps": 140.0,
    "chol": 268.0,
    "fbs": 0,
    "restecg": 1,
    "thalach": 160.0,
    "exang": 1,
    "oldpeak": 3.6,
    "slope": 2,
    "ca": 2.0,
    "thal": 2
}

VALID_CLASS_0_FEATURES = {
    "age": 45.0,
    "sex": 0,
    "cp": 0,
    "trestbps": 110.0,
    "chol": 180.0,
    "fbs": 0,
    "restecg": 0,
    "thalach": 175.0,
    "exang": 0,
    "oldpeak": 0.0,
    "slope": 0,
    "ca": 0.0,
    "thal": 1
}

def create_test_patient(client, auth_headers):
    res = client.post("/api/patients", json={
        "name": "Test Subject",
        "age": 60,
        "sex": 0,
        "mrn": "PT-TEST-001"
    }, headers=auth_headers)
    return res.json()["id"]

def test_prediction_class_1_inference(client, auth_headers):
    p_id = create_test_patient(client, auth_headers)
    res = client.post(f"/api/assessments/{p_id}/predict", json=VALID_CLASS_1_FEATURES, headers=auth_headers)
    assert res.status_code == 201
    data = res.json()
    assert data["prediction"] == 1
    assert "heart disease category present" in data["classification_label"].lower()
    assert data["features"]["oldpeak"] == 3.6
    assert data["probability_class_1"] > 0.5
    assert data["reference_id"].startswith("ASM-")

def test_prediction_class_0_inference(client, auth_headers):
    p_id = create_test_patient(client, auth_headers)
    res = client.post(f"/api/assessments/{p_id}/predict", json=VALID_CLASS_0_FEATURES, headers=auth_headers)
    assert res.status_code == 201
    data = res.json()
    assert data["prediction"] == 0
    assert "no heart disease" in data["classification_label"].lower()
    assert data["probability_class_0"] > 0.5

def test_13_feature_validation_rejection(client, auth_headers):
    p_id = create_test_patient(client, auth_headers)

    # Missing a required feature (e.g. 'thalach')
    bad_features = VALID_CLASS_1_FEATURES.copy()
    del bad_features["thalach"]
    res = client.post(f"/api/assessments/{p_id}/predict", json=bad_features, headers=auth_headers)
    assert res.status_code == 422

    # Invalid category code for cp (e.g. 99)
    bad_cp = VALID_CLASS_1_FEATURES.copy()
    bad_cp["cp"] = 99
    res_cp = client.post(f"/api/assessments/{p_id}/predict", json=bad_cp, headers=auth_headers)
    assert res_cp.status_code == 422

    # Invalid range for age (e.g. 250)
    bad_age = VALID_CLASS_1_FEATURES.copy()
    bad_age["age"] = 250
    res_age = client.post(f"/api/assessments/{p_id}/predict", json=bad_age, headers=auth_headers)
    assert res_age.status_code == 422

def test_historical_snapshot_preservation_after_patient_edit(client, auth_headers):
    p_id = create_test_patient(client, auth_headers)

    # Run assessment with age 62
    res_ass = client.post(f"/api/assessments/{p_id}/predict", json=VALID_CLASS_1_FEATURES, headers=auth_headers)
    ass_id = res_ass.json()["assessment_id"]

    # Now edit the patient
    client.patch(f"/api/patients/{p_id}", json={
        "name": "Modified Patient Name",
        "age": 75,
        "ward": "Discharged"
    }, headers=auth_headers)

    # Verify historical assessment STILL preserves original snapshot
    res_ass_check = client.get(f"/api/assessments/{ass_id}", headers=auth_headers)
    assert res_ass_check.status_code == 200
    ass_data = res_ass_check.json()
    assert ass_data["features"]["age"] == 62.0
    assert ass_data["features"]["chol"] == 268.0
    assert ass_data["prediction"] == 1

def test_update_clinical_notes(client, auth_headers):
    p_id = create_test_patient(client, auth_headers)
    res_ass = client.post(f"/api/assessments/{p_id}/predict", json=VALID_CLASS_1_FEATURES, headers=auth_headers)
    ass_id = res_ass.json()["assessment_id"]

    # Update doctor notes
    notes_payload = {
        "doctor_notes": "Urgent coronary angiogram scheduled. Beta-blocker titrated.",
        "recommended_protocol": "Urgent Cath Lab",
        "follow_up_text": "In 48h",
        "status": "reviewed"
    }
    res_notes = client.patch(f"/api/assessments/{ass_id}/notes", json=notes_payload, headers=auth_headers)
    assert res_notes.status_code == 200
    assert res_notes.json()["status"] == "reviewed"

    # Verify notes persisted
    res_get = client.get(f"/api/assessments/{ass_id}", headers=auth_headers)
    assert "Urgent coronary angiogram" in res_get.json()["doctor_notes"]
    assert res_get.json()["follow_up_text"] == "In 48h"

def test_save_and_update_draft(client, auth_headers):
    p_id = create_test_patient(client, auth_headers)
    # Save incomplete draft with only 3 features
    res_draft = client.post(f"/api/patients/{p_id}/assessments/drafts", json={
        "age": 55,
        "sex": 1,
        "cp": 2,
        "doctor_notes": "Work in progress"
    }, headers=auth_headers)
    assert res_draft.status_code == 200
    draft_id = res_draft.json()["assessment_id"]

    # Update draft
    res_up = client.patch(f"/api/assessments/{draft_id}/draft", json={
        "trestbps": 135,
        "chol": 240
    }, headers=auth_headers)
    assert res_up.status_code == 200
