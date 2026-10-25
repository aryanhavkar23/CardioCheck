def test_generate_pdf_report_success(client, auth_headers):
    # Create patient and assessment
    p_res = client.post("/api/patients", json={
        "name": "Report Patient",
        "age": 62,
        "sex": 0,
        "mrn": "PT-REPORT-01"
    }, headers=auth_headers)
    p_id = p_res.json()["id"]

    ass_res = client.post(f"/api/assessments/{p_id}/predict", json={
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
    }, headers=auth_headers)
    ass_id = ass_res.json()["assessment_id"]

    # Request PDF report
    pdf_res = client.get(f"/api/assessments/{ass_id}/report", headers=auth_headers)
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    content = pdf_res.content
    assert content.startswith(b"%PDF-")
    assert len(content) > 1000

def test_generate_pdf_report_unauthorized_isolation(client, auth_headers, second_doctor_headers):
    p_res = client.post("/api/patients", json={
        "name": "Doctor A Secret Patient",
        "age": 58,
        "sex": 1
    }, headers=auth_headers)
    p_id = p_res.json()["id"]

    ass_res = client.post(f"/api/assessments/{p_id}/predict", json={
        "age": 58.0,
        "sex": 1,
        "cp": 0,
        "trestbps": 120.0,
        "chol": 200.0,
        "fbs": 0,
        "restecg": 0,
        "thalach": 150.0,
        "exang": 0,
        "oldpeak": 0.0,
        "slope": 0,
        "ca": 0.0,
        "thal": 1
    }, headers=auth_headers)
    ass_id = ass_res.json()["assessment_id"]

    # Doctor B attempts to download report
    b_res = client.get(f"/api/assessments/{ass_id}/report", headers=second_doctor_headers)
    assert b_res.status_code == 404
