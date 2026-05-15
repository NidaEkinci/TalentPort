from pydantic import BaseModel, EmailStr
from typing import Optional, List

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

class Skill(BaseModel):
    name:  str
    level: str  # Başlangıç | Orta | İleri

class ApplicationForm(BaseModel):
    #Temel
    job_id: str
    job_title: str
    name: str
    email: str
    phone: Optional[str] = ""
    cover_letter: Optional[str] = ""

    # Eğitim
    graduation_status: Optional[str] = ""   # Öğrenci | Mezun | Yüksek Lisans
    university:        Optional[str] = ""
    department:        Optional[str] = ""
    graduation_year:   Optional[str] = ""
    gpa:               Optional[str] = ""

    # Yetkinlikler
    skills:      Optional[List[Skill]] = []
    cert_links:  Optional[List[str]]   = []  # sertifika URL listesi

    # Deneyim
    company:      Optional[str] = ""
    position:     Optional[str] = ""
    github:       Optional[str] = ""
    linkedin:     Optional[str] = ""

    # Tercihler
    work_model:   Optional[str] = ""   # Remote | Hibrit | Ofis
    military:     Optional[str] = ""   # Yapıldı | Muaf | Tecilli
    driving_license: Optional[bool] = False


    cv_text: Optional[str] = ""  # AI'dan gelen CV metni


class HybridSearchParams(BaseModel):
    max_results:     int   = 10
    semantic_pool:   int   = 50
    semantic_weight: float = 0.6
    tfidf_weight:    float = 0.4


class MatchedJob(BaseModel):
    id:             str
    title:          str
    company:        str
    location:       str
    description:    str
    semantic_score: float
    tfidf_score:    float
    combined_score: float


class CVMatchResponse(BaseModel):
    cv_text: str
    jobs:    List[MatchedJob]