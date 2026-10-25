def test_create_and_get_patient(client, auth_headers):
    payload = {
        "name": "Jane Doe",
        "age": 55,
        "sex": 0,
        "mrn": "PT-7701",
        "dob": "1969-05-12",
        "blood_group": "B+",
        "ward": "Cardiology 2B"
    }
    res = client.post("/api/patients", json=payload, headers=auth_headers)
    assert res.status_code == 201
    p_data = res.json()
    assert p_data["name"] == "Jane Doe"
    assert p_data["mrn"] == "PT-7701"
    assert p_data["age"] == 55
    p_id = p_data["id"]

    # Retrieve patient
    res_get = client.get(f"/api/patients/{p_id}", headers=auth_headers)
    assert res_get.status_code == 200
    assert res_get.json()["name"] == "Jane Doe"

def test_patient_auto_generated_mrn(client, auth_headers):
    payload = {
        "name": "John Auto",
        "age": 48,
        "sex": 1
    }
    res = client.post("/api/patients", json=payload, headers=auth_headers)
    assert res.status_code == 201
    assert res.json()["mrn"].startswith("PT-")

def test_patient_access_isolation_between_doctors(client, auth_headers, second_doctor_headers):
    # Doctor A creates a patient
    res = client.post("/api/patients", json={
        "name": "Confidential Patient",
        "age": 60,
        "sex": 1,
        "mrn": "PT-CONF-01"
    }, headers=auth_headers)
    p_id = res.json()["id"]

    # Doctor B attempts to view Doctor A's patient
    res_b = client.get(f"/api/patients/{p_id}", headers=second_doctor_headers)
    assert res_b.status_code == 404

    # Doctor B attempts to edit Doctor A's patient
    res_b_edit = client.patch(f"/api/patients/{p_id}", json={"name": "Hacked Name"}, headers=second_doctor_headers)
    assert res_b_edit.status_code == 404

    # Doctor B's patient list does NOT contain Doctor A's patient
    res_b_list = client.get("/api/patients", headers=second_doctor_headers)
    assert len(res_b_list.json()) == 0

def test_patient_update_preserves_id_and_mrn(client, auth_headers):
    res = client.post("/api/patients", json={
        "name": "Original Name",
        "age": 50,
        "sex": 0,
        "mrn": "PT-IMMUTABLE-01"
    }, headers=auth_headers)
    p_id = res.json()["id"]

    res_patch = client.patch(f"/api/patients/{p_id}", json={
        "name": "Updated Name",
        "allergies": "Sulfa drugs"
    }, headers=auth_headers)
    assert res_patch.status_code == 200
    assert res_patch.json()["name"] == "Updated Name"
    assert res_patch.json()["allergies"] == "Sulfa drugs"
    assert res_patch.json()["mrn"] == "PT-IMMUTABLE-01"

def test_patient_search(client, auth_headers):
    client.post("/api/patients", json={"name": "Alice Wonderland", "age": 30, "sex": 0, "mrn": "PT-ALICE"}, headers=auth_headers)
    client.post("/api/patients", json={"name": "Bob Builder", "age": 40, "sex": 1, "mrn": "PT-BOB"}, headers=auth_headers)

    res_search = client.get("/api/patients?search=Alice", headers=auth_headers)
    assert res_search.status_code == 200
    assert len(res_search.json()) == 1
    assert res_search.json()[0]["name"] == "Alice Wonderland"

    res_search_mrn = client.get("/api/patients?search=BOB", headers=auth_headers)
    assert res_search_mrn.status_code == 200
    assert len(res_search_mrn.json()) == 1
    assert res_search_mrn.json()[0]["name"] == "Bob Builder"
