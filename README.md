# TalentPort

İş ilanları ve başvuru arayüzü. **Backend** (FastAPI) ve **Frontend** (React + Vite) ayrı çalışır; tarayıcıdaki istekler Vite üzerinden `/api` ile backend’e yönlendirilir.

## Gereksinimler

- Python 3.12+
- Node.js 18+ (npm)

## Hızlı başlangıç

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

`backend` klasöründe `.env` dosyası oluştur (örnek değişkenler):

| Değişken | Açıklama |
|----------|----------|
| `QDRANT_URL` | Qdrant sunucu adresi |
| `QDRANT_API_KEY` | Qdrant API anahtarı |
| `SECRET_KEY` | JWT için gizli anahtar |
| `GOOGLE_API_KEY` | CV’yi yapılandırmak için Gemini (parse-cv / cv-match) |
| `GTE_MODEL_NAME` | İsteğe bağlı; varsayılan: `Alibaba-NLP/gte-multilingual-base` |
| `GTE_DEVICE` | İsteğe bağlı; `cpu`, `cuda` veya `mps` |

Sunucuyu başlat:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API dokümantasyonu: [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Frontend

Yeni bir terminalde:

```bash
cd frontend
npm install
npm run dev
```

Varsayılan adres genelde [http://localhost:5173](http://localhost:5173). `/api` istekleri otomatik olarak `http://localhost:8000` adresine gider.

## Önemli notlar

- **Kullanıcı ve başvurular** SQLite (`backend/talentport.db`) üzerinde tutulur; ilk çalıştırmada tablolar oluşturulur.
- **CV eşleştirme** (`POST /api/cv-match`) Qdrant’taki **`gte_job_postings`** koleksiyonunu kullanır. Koleksiyon yoksa veya boşsa eşleştirme çalışmaz; önce ilanların vektörlerinin bu koleksiyona yüklenmesi gerekir (768 boyut, cosine mesafesi).

## Ana API uçları (özet)

- `POST /api/register`, `POST /api/login` — kayıt / giriş  
- `POST /api/parse-cv` — PDF yükle, Gemini ile yapılandırılmış CV JSON  
- `POST /api/cv-match` — PDF + hibrit arama parametreleri, sıralı ilanlar  
- `POST /api/jobs/search` — vektör ile semantik arama (mevcut)

Detaylar için backend’de `/docs` sayfasına bak.
