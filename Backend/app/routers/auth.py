from datetime import datetime, timedelta, timezone
from typing import Optional
import bcrypt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..models.user import User
from ..schemas.auth import DoctorRegister, DoctorLogin, DoctorOut, TokenResponse

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
security = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials not provided. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session token.")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials or token expired.")

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Doctor account not found.")
    return user

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(doc_in: DoctorRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == doc_in.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already registered.")

    hashed = hash_password(doc_in.password)
    user = User(
        email=doc_in.email,
        hashed_password=hashed,
        full_name=doc_in.full_name,
        department=doc_in.department or "Cardiology Dept",
        license_number=doc_in.license_number
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": user.email, "uid": user.id})
    return TokenResponse(access_token=token, token_type="bearer", doctor=DoctorOut.model_validate(user))

@router.post("/login", response_model=TokenResponse)
def login(creds: DoctorLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == creds.email).first()
    if not user or not verify_password(creds.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")

    token = create_access_token(data={"sub": user.email, "uid": user.id})
    return TokenResponse(access_token=token, token_type="bearer", doctor=DoctorOut.model_validate(user))

@router.get("/me", response_model=DoctorOut)
def get_me(current_user: User = Depends(get_current_user)):
    return DoctorOut.model_validate(current_user)

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    return {"message": "Successfully signed out of clinical session."}
