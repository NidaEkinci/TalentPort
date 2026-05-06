from pydantic import BaseModel, EmailStr
from typing import Optional

class Job(BaseModel):
    id: str
    title: str
    company: str
    location: str
    description: str

class RegisterRequest(BaseModel):
    name:     str
    email:    str
    password: str

class LoginRequest(BaseModel):
    email:    str
    password: str

class ApplicationForm(BaseModel):
    job_id: str
    job_title: str
    name: str
    email: str
    phone: Optional[str] = ""
    cover_letter: Optional[str] = ""
    cv_text: Optional[str] = ""  # AI'dan gelen CV metni