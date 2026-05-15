"""CV ayrıştırma: PDF okuma + Gemini ile yapılandırılmış JSON çıkarımı.

JobScoutAI/utils.py'den taşındı. Gemini client'ı lazy initialize edilir,
böylece GOOGLE_API_KEY olmadan da modül import edilebilir.
"""
import io
import json
import os
import re
from typing import Optional, Union

import fitz
from google import genai


def cv_temizle_master(ham_metin: str) -> str:
    temiz = ham_metin.replace("\n", " ")
    temiz = re.sub(
        r"(?<= )[A-ZİıĞğÜüŞşÖöçÇ] (?=[A-ZİıĞğÜüŞşÖöçÇ] )",
        lambda m: m.group(0).strip(),
        temiz,
    )
    temiz = re.sub(
        r"([A-ZİıĞğÜüŞşÖöçÇ]) (?=[A-ZİıĞğÜüŞşÖöçÇ]\b)", r"\1", temiz
    )
    temiz = re.sub(r"\s+", " ", temiz)
    return temiz.strip()


def pdf_oku(file_or_stream: Union[bytes, io.BytesIO, "io.IOBase"]) -> str:
    """PDF byte'larını veya stream'ini okuyup iki sütunlu CV'leri düzgün
    ayrıştırarak temizlenmiş metin döndürür."""
    if isinstance(file_or_stream, (bytes, bytearray)):
        stream_bytes = bytes(file_or_stream)
    elif hasattr(file_or_stream, "read"):
        stream_bytes = file_or_stream.read()
    else:
        raise TypeError("pdf_oku: bytes veya read() destekleyen bir nesne bekliyor")

    text_list = []
    with fitz.open(stream=stream_bytes, filetype="pdf") as doc:
        for page in doc:
            width = page.rect.width
            middle_line = width / 2.5
            blocks = page.get_text("blocks")
            left_col, right_col = [], []
            for b in blocks:
                x0 = b[0]
                (left_col if x0 < middle_line else right_col).append(b)
            for col in (
                sorted(left_col, key=lambda b: b[1]),
                sorted(right_col, key=lambda b: b[1]),
            ):
                for b in col:
                    if b[4].strip():
                        text_list.append(b[4].strip())
    return cv_temizle_master("\n".join(text_list))


_gemini_client: Optional[genai.Client] = None


def _get_gemini_client() -> genai.Client:
    """Gemini client'ı ilk çağrıda oluşturur, sonraki çağrılarda cache'ler."""
    global _gemini_client
    if _gemini_client is None:
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise RuntimeError(
                "GOOGLE_API_KEY environment variable tanımlı değil"
            )
        _gemini_client = genai.Client(api_key=api_key)
    return _gemini_client


def gemini_ayristir(cv_metni: str) -> Optional[dict]:
    """CV metnini Gemini'ye yollar, yapılandırılmış JSON döndürür.
    Hata durumunda None döner (mevcut davranış korunur)."""
    prompt = f"""
    Sen profesyonel bir İK veri analiz uzmanısın.
    Aşağıda sana verilen CV metnini analiz et ve bilgileri TAM OLARAK şu JSON formatında döndür.
    Eğer bir bilgi CV'de yoksa, o alanı boş string ("") veya boş liste ([]) olarak bırak.
    LÜTFEN sadece JSON döndür, açıklama yapma.

    İstenen JSON Formatı:
    {{
        "name": "Adayın Adı Soyadı",
        "email": "E-posta adresi",
        "phone": "Telefon numarası",
        "graduation_status": "Öğrenci veya Mezun veya Yüksek Lisans",
        "university": "Üniversite adı",
        "department": "Bölüm adı",
        "graduation_year": "Mezuniyet yılı",
        "gpa": "Not ortalaması",
        "skills": [{{ "name": "Yetenek", "level": "Başlangıç/Orta/İleri" }}],
        "cert_links": [],
        "company": "Son çalıştığı şirket",
        "position": "Son pozisyonu",
        "github": "GitHub profil linki",
        "linkedin": "LinkedIn profil linki",
        "work_model": "Remote veya Hibrit veya Ofis",
        "military": "Yapıldı veya Muaf veya Tecilli veya Yükümlü Değil",
        "driving_license": false
    }}

    CV METNİ:
    {cv_metni}
    """

    try:
        client = _get_gemini_client()
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        clean = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(clean)
    except Exception as e:
        print(f"Gemini AI Parsing Hatası: {e}")
        return None
