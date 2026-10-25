from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from ..database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False, default="Doctor")
    department = Column(String(255), nullable=False, default="Cardiology Dept")
    license_number = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    patients = relationship("Patient", back_populates="doctor", cascade="all, delete-orphan")
    assessments = relationship("Assessment", back_populates="doctor", cascade="all, delete-orphan")
