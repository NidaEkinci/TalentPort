import os
import sqlite3
from dotenv import load_dotenv
from qdrant_client import QdrantClient

load_dotenv()

client = QdrantClient(
    url=os.getenv("QDRANT_URL"),
    api_key=os.getenv("QDRANT_API_KEY"),
    timeout=60
)

COLLECTION = "gte_job_postings"  # veya "gte_job_postings"

# SQLite — kullanıcılar ve başvurular
DB_PATH = "talentport.db"

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id         TEXT PRIMARY KEY,
            email      TEXT UNIQUE NOT NULL,
            name       TEXT NOT NULL,
            password   TEXT NOT NULL,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS applications (
            id           TEXT PRIMARY KEY,
            user_id      TEXT,
            job_id       TEXT NOT NULL,
            job_title    TEXT,
            name         TEXT NOT NULL,
            email        TEXT NOT NULL,
            phone        TEXT,
            cover_letter TEXT,
            created_at   TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
    """)
    conn.commit()
    conn.close()

init_db()