import os
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

SECRET_KEY = os.getenv("SECRET_KEY", "talentport-super-secret-change-in-prod")
ALGORITHM  = "HS256"
TOKEN_EXPIRE_HOURS = 24 * 7  # 1 hafta

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer      = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_token(user_id: str, email: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS)
    return jwt.encode(
        {"sub": user_id, "email": email, "exp": expire},
        SECRET_KEY, algorithm=ALGORITHM
    )

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Geçersiz token")

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(bearer)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Token gerekli")
    return decode_token(credentials.credentials)

def get_optional_user(credentials: HTTPAuthorizationCredentials = Security(bearer)):
    """Token yoksa None döner — opsiyonel auth için"""
    if not credentials:
        return None
    try:
        return decode_token(credentials.credentials)
    except Exception:
        return None