# CV Analyzer – Monorepo Django (backend) + Next.js (frontend)

Analyse et matching de CV (parsing, structuration, scoring, *LLM insights* en option) + persistance MongoDB. Le dépôt est organisé en **monorepo** avec un répertoire `backend/` (Django) et `frontend/` (Next.js 14).

---

## ⚙️ Pile technique

* **Backend** : Django, endpoints d’upload et d’analyse (`cv_ai`, `cv_app`)
* **Persistance** : MongoEngine (MongoDB) pour les collections `JobPosting`, `Candidate`, `Analysis`, `DocumentFile` (GridFS)
* **DB Django** : SQLite par défaut pour l’admin et les apps classiques
* **Frontend** : Next.js 14 (app router), TypeScript
* **LLM (optionnel)** : Hugging Face Inference (ex. `mistralai/Mistral-7B-Instruct-v0.3`) pour les *insights*

---

## 🗂️ Arborescence

```
backend/
  core/                # projet Django (settings, urls, etc.)
  cv_ai/               # parsing, structuration, matching (services)
  cv_app/              # modèles MongoEngine + persistance
  venv/                # environnement virtuel (local)
  .env                 # variables d'env backend
  db.sqlite3           # DB Django (admin, etc.)
  manage.py
  requirements.txt

frontend/
  app/                 # pages/app router
  components/          # composants UI
  public/
  next.config.ts
  package.json
  ...

docker-compose.yml     # (à venir)
```

---

## 🔑 Prérequis

* **Python** ≥ 3.10
* **Node.js** ≥ 18 + **npm** ≥ 9
* **MongoDB** ≥ 5 (en local : `mongodb://localhost:27017`)
* **Git**
* (Optionnel) **HuggingFace** API token si vous activez les *insights*

---

## 🛠️ Installation – Backend (Django)

1. **Créer l’environnement & installer les dépendances**

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
# source venv/bin/activate

pip install -r requirements.txt
```

2. **Configurer l’environnement** (`backend/.env`)

```env
JWT_SECRET=change-me-super-secret
JWT_ALG=HS256
JWT_EXPIRES_H=24

HF_API_TOKEN=hf_lS______________
HF_MODEL=mistralai/Mistral-7B-Instruct-v0.3
HF_MAX_NEW_TOKENS=800

```

> **Note** : Django continuera d’utiliser **SQLite** pour ses propres apps (migrations/admin). **MongoDB** sert aux modèles `cv_app.*` via **MongoEngine**.

3. **Migrations Django (SQLite)**

```bash
python manage.py migrate
```

4. **Lancer le serveur**

```bash
python manage.py runserver 0.0.0.0:8000
```

Backend dispo sur `http://localhost:8000/`.

---

## 🧪 Endpoints clés

### POST `/api/parse-cv`

Upload 1..N CV en **multipart/form-data**, optionnellement **structure** et **analyse**, puis (par défaut) **persiste** en base.

**Query/Body flags**

* `structure=1` : retourne `structured` par CV
* `analyze=1` : calcule `analysis.top_k` (nécessite `structured`)
* `persist=0` : **désactive** la persistance Mongo (par défaut **ON**)

**Champs fiche de poste** (pour `analyze=1`)

* `title`, `company`, `location`, `experience_required`, `description`, `required_skills`
* alias acceptés : `job_location/location`, `experience`, `job_description/description`, `skills/required_skills`
* optionnels : `top_k`, `llm_insights` (1/0), `llm_on_top_n`

**Fichiers**

* `file` (répétable) ou `files` (multiple)

#### cURL minimal (1 CV, structure uniquement)

```bash
curl -X POST "http://localhost:8000/api/parse-cv?structure=1" \
  -F "file=@/chemin/vers/cv1.pdf"
```

#### cURL complet (multi-CV, structure + analyse + persistance)

```bash
curl -X POST "http://localhost:8000/api/parse-cv?structure=1&analyze=1" \
  -F "file=@/cv1.pdf" \
  -F "files=@/cv2.pdf" \
  -F "title=Développeur Full Stack" \
  -F "company=Acme" \
  -F "location=Paris, France" \
  -F "experience_required=3-5 ans" \
  -F "description=Stack Python/Django/React, Docker, CI/CD" \
  -F "required_skills=python,django,react,docker" \
  -F "top_k=10" -F "llm_insights=1" -F "llm_on_top_n=10"
```

#### Postman

1. **Method**: POST – URL: `http://localhost:8000/api/parse-cv?structure=1&analyze=1`
2. **Body**: `form-data`

   * key `file` → *File* → sélectionner 1..N fichiers
   * clés texte : `title`, `company`, `location`, `experience_required`, `description`, `required_skills`
   * booléens/numériques : `top_k`, `llm_insights`, `llm_on_top_n`, `persist`

**Réponse** (selon flags)

* `results[]` : parsing par CV (`parsed.raw_text`, `structured`, ...)
* `analysis` : tri par score avec `breakdown`, `matched_skills`, `insights` (si activé)
* `persisted` : ids Mongo `{ job_id, saved: [{candidate_id, analysis_id}, ...] }`

> **Astuce** : `persist=0` pour tester sans rien écrire en base.

---

## 🖥️ Installation – Frontend (Next.js)

1. **Dépendances**

```bash
cd frontend
npm install
```

2. **Config** `frontend/.env.local`

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

3. **Lancement**

```bash
npm run dev
```

Frontend dispo sur `http://localhost:3000`.

---

## 📐 Scoring & Persistance (récap)

* Le **matcher** calcule des ratios `skills/desc/exp/loc` (0..1). `education` est estimé si absent.
* La **persistance** recombine un `overall_score` **/10** à partir des sous-scores + poids (y compris `MATCHER_EDU_WEIGHT`).
* `education_score` est toujours renseigné (breakdown → /10, sinon heuristique depuis `education[]`).

---

## 🧰 Dépannage

* **MongoDB non lancé** : erreurs de connexion MongoEngine → démarrer `mongod`.
* **HF non configuré** : les `insights` seront simplement vides (pas bloquant).
* **CORS** : autoriser `http://localhost:3000` dans les settings si besoin.
* **Upload limit** : ajuster `DATA_UPLOAD_MAX_MEMORY_SIZE` / `FILE_UPLOAD_MAX_MEMORY_SIZE` côté Django.
* **Windows/Temp** : les CV sont placés dans `%TEMP%/cv_analyzer_uploads` avant persistance GridFS.

---

## 🗺️ Roadmap

* Docker & docker-compose (Mongo + API + Front)
* Auth + UI d’annotation
* Score model tuning & feedback loop

---

