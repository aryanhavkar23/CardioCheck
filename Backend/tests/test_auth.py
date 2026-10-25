def test_register_doctor_success(client):
    res = client.post("/api/auth/register", json={
        "email": "new.doctor@clinic.org",
        "password": "SecurePassword123!",
        "full_name": "Dr. Alice Smith, MD",
        "department": "Internal Medicine",
        "license_number": "LIC-88912"
    })
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["doctor"]["email"] == "new.doctor@clinic.org"
    assert data["doctor"]["full_name"] == "Dr. Alice Smith, MD"

def test_register_duplicate_email_fails(client):
    doc = {
        "email": "dup@clinic.org",
        "password": "SecurePassword123!",
        "full_name": "Dr. Duplicate, MD"
    }
    res1 = client.post("/api/auth/register", json=doc)
    assert res1.status_code == 201

    res2 = client.post("/api/auth/register", json=doc)
    assert res2.status_code == 400
    assert "already registered" in res2.json()["detail"].lower()

def test_login_success(client):
    client.post("/api/auth/register", json={
        "email": "login.test@clinic.org",
        "password": "MyPassword123!",
        "full_name": "Dr. Bob, MD"
    })
    res = client.post("/api/auth/login", json={
        "email": "login.test@clinic.org",
        "password": "MyPassword123!"
    })
    assert res.status_code == 200
    assert "access_token" in res.json()

def test_login_invalid_credentials(client):
    res = client.post("/api/auth/login", json={
        "email": "unknown@clinic.org",
        "password": "WrongPassword"
    })
    assert res.status_code == 401

def test_unauthorized_access_fails(client):
    res = client.get("/api/auth/me")
    assert res.status_code == 401

def test_authorized_me_endpoint(client, auth_headers):
    res = client.get("/api/auth/me", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["email"] == "dr.watson@hospital.org"

def test_logout(client, auth_headers):
    res = client.post("/api/auth/logout", headers=auth_headers)
    assert res.status_code == 200
