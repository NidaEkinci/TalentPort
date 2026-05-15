from fastapi import FastAPI, HTTPException, Security, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials
from database import client, COLLECTION, get_db
from models import (
    Job, ApplicationForm, RegisterRequest, LoginRequest,
    HybridSearchParams, MatchedJob, CVMatchResponse,
)
from auth import (
    hash_password, verify_password, create_token, get_current_user, get_optional_user, bearer
)
from services.cv_parser import pdf_oku, gemini_ayristir
from services.hybrid_search import hybrid_search
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
import uuid

class SemanticSearchRequest(BaseModel):
    vector: List[float]
    limit: int = 10

app = FastAPI(title="TalentPort API")

# CORS — React frontend'in erişmesi için
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Deploy'da frontend URL'ini yazın
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- AUTH ---

@app.post("/api/register")
def register(req: RegisterRequest):
    db = get_db()
    # Email kontrolü
    existing = db.execute("SELECT id FROM users WHERE email=?", (req.email,)).fetchone()
    if existing:
        raise HTTPException(status_code=400, detail="Bu email zaten kayıtlı")

    user_id = str(uuid.uuid4())
    db.execute(
        "INSERT INTO users (id, email, name, password, created_at) VALUES (?,?,?,?,?)",
        (user_id, req.email, req.name, hash_password(req.password), datetime.utcnow().isoformat())
    )
    db.commit()
    db.close()

    token = create_token(user_id, req.email)
    return {"token": token, "name": req.name, "email": req.email}


@app.post("/api/login")
def login(req: LoginRequest):
    db = get_db()
    user = db.execute("SELECT * FROM users WHERE email=?", (req.email,)).fetchone()
    db.close()

    if not user or not verify_password(req.password, user["password"]):
        raise HTTPException(status_code=401, detail="Email veya şifre hatalı")

    token = create_token(user["id"], user["email"])
    return {"token": token, "name": user["name"], "email": user["email"]}


@app.get("/api/me")
def me(current_user=Depends(get_current_user)):
    return current_user

# --- JOBS ---

@app.get("/api/jobs")
def get_jobs(limit: int = 20, offset: int = 0, search: Optional[str] = None):
    """Tüm ilanları listele — AI motorunuz bu endpoint'i kullanır"""
    results, next_offset = client.scroll(
        collection_name=COLLECTION,
        limit=limit,
        offset=offset,
        with_payload=True,
        with_vectors=False
    )
    jobs = []
    for r in results:
        p = r.payload
        jobs.append({
            "id": str(p.get("job_id", r.id)),
            "title": p.get("title", ""),
            "company": p.get("company", p.get("company_name", "")),
            "location": p.get("location", ""),
            "description": p.get("description", "")[:300] + "...",  # Liste için kısa
        })

    # Basit arama filtresi
    if search:
        search = search.lower()
        jobs = [j for j in jobs if search in j["title"].lower() 
                or search in j["company"].lower()]

    return {"jobs": jobs, "total": len(jobs)}


@app.get("/api/jobs/{job_id}")
def get_job(job_id: str):
    try:
        job_id_int = int(job_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Geçersiz ilan ID")

    offset = None
    while True:
        results, next_offset = client.scroll(
            collection_name=COLLECTION,
            limit=100,
            offset=offset,
            with_payload=True,
            with_vectors=False
        )
        for r in results:
            p = r.payload
            if p.get("job_id") == job_id_int or p.get("job_id") == job_id:
                return {
                    "id":          str(p.get("job_id", r.id)),
                    "title":       p.get("title", ""),
                    "company":     p.get("company", p.get("company_name", "")),
                    "location":    p.get("location", ""),
                    "description": p.get("description", ""),
                }
        if next_offset is None:
            break
        offset = next_offset

    raise HTTPException(status_code=404, detail="İlan bulunamadı")

@app.post("/api/jobs/search")
def semantic_search(req: SemanticSearchRequest):
    """JobScoutAI'ın CV vektörü göndererek ilan aradığı endpoint"""
    hits = client.query_points(
        collection_name=COLLECTION,
        query=req.vector,
        limit=req.limit,
        with_payload=True
    ).points

    return {
        "jobs": [
            {
                "id":          str(h.payload.get("job_id", h.id)),
                "title":       h.payload.get("title", ""),
                "company":     h.payload.get("company", h.payload.get("company_name", "")),
                "location":    h.payload.get("location", ""),
                "description": h.payload.get("description", ""),
                "score":       h.score,
            }
            for h in hits
        ]
    }


# --- CV PARSING & HYBRID MATCHING ---

@app.post("/api/parse-cv")
async def parse_cv(file: UploadFile = File(...)):
    """PDF CV'yi okur, Gemini ile yapılandırılmış JSON form alanlarına çevirir."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Sadece PDF dosyası kabul edilir")

    try:
        pdf_bytes = await file.read()
        cv_text = pdf_oku(pdf_bytes)
        if not cv_text:
            return {"error": "PDF'den metin çıkarılamadı"}

        parsed = gemini_ayristir(cv_text)
        if parsed is None:
            return {"error": "Gemini CV'yi ayrıştıramadı"}
        return parsed
    except Exception as e:
        return {"error": str(e)}


@app.post("/api/cv-match", response_model=CVMatchResponse)
async def cv_match(
    file:            UploadFile = File(...),
    max_results:     int        = Form(10),
    semantic_pool:   int        = Form(50),
    semantic_weight: float      = Form(0.6),
    tfidf_weight:    float      = Form(0.4),
):
    """PDF CV'yi okur ve hibrit arama (semantic + TF-IDF) ile en uygun ilanları sıralar."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Sadece PDF dosyası kabul edilir")

    pdf_bytes = await file.read()
    cv_text = pdf_oku(pdf_bytes)
    if not cv_text:
        raise HTTPException(status_code=422, detail="PDF'den metin çıkarılamadı")

    jobs = hybrid_search(
        cv_text=cv_text,
        max_results=max_results,
        semantic_pool=semantic_pool,
        semantic_weight=semantic_weight,
        tfidf_weight=tfidf_weight,
    )
    return CVMatchResponse(cv_text=cv_text, jobs=[MatchedJob(**j) for j in jobs])


# --- APPLICATIONS ---

@app.post("/api/apply")
def apply(
    form: ApplicationForm,
    credentials: HTTPAuthorizationCredentials = Security(bearer)
):
    import json
    current_user = get_optional_user(credentials)
    user_id = current_user["sub"] if current_user else None

    db = get_db()
    app_id = str(uuid.uuid4())
    db.execute(
        """INSERT INTO applications (
           id, user_id, job_id, job_title, name, email, phone, cover_letter,
           graduation_status, university, department, graduation_year, gpa,
           skills, cert_links,
           company, position, github, linkedin,
           work_model, military, driving_license,
           created_at
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (
            app_id, user_id, form.job_id, form.job_title,
            form.name, form.email, form.phone, form.cover_letter,
            form.graduation_status, form.university, form.department, form.graduation_year, form.gpa,
            json.dumps([s.model_dump() for s in form.skills], ensure_ascii=False),
            json.dumps(form.cert_links, ensure_ascii=False),
            form.company, form.position, form.github, form.linkedin,
            form.work_model, form.military,
            1 if form.driving_license else 0,
            datetime.utcnow().isoformat()
        )
    )
    db.commit()
    db.close()
    return {"success": True, "message": "Başvurunuz alındı!"}


@app.get("/api/my-applications")
def my_applications(current_user=Depends(get_current_user)):
    db = get_db()
    rows = db.execute(
        "SELECT * FROM applications WHERE user_id=? ORDER BY created_at DESC",
        (current_user["sub"],)
    ).fetchall()
    db.close()
    return {"applications": [dict(r) for r in rows]}