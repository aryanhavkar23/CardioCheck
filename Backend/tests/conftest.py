import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Set test environment
os.environ["ENV"] = "testing"
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from app.database import Base, get_db
from app.main import app
from app.seed import seed_database
from app.services.model_loader import ModelLoader

# In-memory SQLite for fast, isolated testing
engine_test = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine_test)

@pytest.fixture(scope="session", autouse=True)
def setup_models():
    # Verify model is ready
    ModelLoader.get_instance()

@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine_test)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine_test)

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def auth_headers(client):
    # Register and login a primary test doctor
    doc_payload = {
        "email": "dr.watson@hospital.org",
        "password": "Password123!",
        "full_name": "Dr. John Watson, MD",
        "department": "Cardiology",
        "license_number": "MD-4401"
    }
    res = client.post("/api/auth/register", json=doc_payload)
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def second_doctor_headers(client):
    # Register and login a second doctor to test isolation
    doc_payload = {
        "email": "dr.house@hospital.org",
        "password": "Diagnostic123!",
        "full_name": "Dr. Gregory House, MD",
        "department": "Diagnostic Medicine",
        "license_number": "MD-9902"
    }
    res = client.post("/api/auth/register", json=doc_payload)
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
