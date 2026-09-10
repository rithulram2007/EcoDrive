# EcoDrive — Production-Quality Full-Stack Assessment Project

> **Drive smarter. Waste less.**  
> A gamified eco-driving and carbon footprint coaching platform that translates vehicle telemetry into actionable efficiency scores, transparent carbon analytics, and personalized driving habits.

---

## 1. Overview & Problem Statement

Transportation accounts for approximately **24% of direct CO₂ emissions from fuel combustion worldwide**, with aggressive driving behaviors—such as rapid accelerations, excessive highway speeds, harsh braking, and unnecessary idling—inflating fuel consumption and emissions by **15% to 35%**.

While modern vehicle telematics generate rich time-series speed and acceleration logs, drivers rarely receive meaningful, real-time feedback or actionable coaching on how their behavioral choices impact energy efficiency and the environment.

**EcoDrive** bridges this gap. It provides an end-to-end analytical platform that:
- Ingests trip telemetry either via manual entry or raw time-series CSV upload.
- Computes a transparent composite **Eco Score (0–100)** with clear, human-intelligible score drop attributions.
- Quantifies carbon footprints using documented EPA/DEFRA emission factors.
- Gamifies sustainable driving habits through deterministic **XP, 5 Driver Tiers, Consecutive Streaks, Badges, and Challenges**.
- Generates deterministic, rule-based personalized coaching tips and weekly executive insights.
- Models head-to-head lifecycle emissions between Internal Combustion Engine (ICE) vehicles and Battery Electric Vehicles (EVs).

---

## 2. Tech Stack & Engineering Rationale

| Tier | Technologies | Architectural Rationale |
| :--- | :--- | :--- |
| **Frontend** | **React 18, TypeScript, Vite, Tailwind CSS** | Ultra-fast HMR, strict type safety across telemetry models, zero bloated UI libraries, responsive Tailwind styling. |
| **Data Viz** | **Recharts, Lucide React** | Lightweight, accessible SVG charts for score trends and time-series telemetry. |
| **Backend** | **Python 3.12, FastAPI, Pydantic V2** | High-performance asynchronous REST API, auto-generated OpenAPI documentation, strict request/response data contracts. |
| **Data Processing** | **Pandas, NumPy** | Resilient time-series aggregation, outlier handling, and kinematic acceleration derivation from speed deltas. |
| **Database & ORM** | **SQLAlchemy 2.0, SQLite (Local), PostgreSQL (Production)** | Clean ORM abstractions, zero-friction local development without requiring external database daemon, seamless cloud deployment to Render PostgreSQL. |
| **Testing** | **pytest, httpx, TestClient** | Fast unit and integration test suite verifying scoring engines, emission math, and REST endpoints. |
| **Deployment** | **Vercel (Frontend), Render (Backend & DB)** | Serverless edge static hosting coupled with cloud containerized web services. |

---

## 3. System Architecture

```
                          +-----------------------------------------------------+
                          |            EcoDrive Web Client (React + TS)         |
                          |  Tailwind CSS • Recharts • Lucide • Axios Client    |
                          +--------------------------+--------------------------+
                                                     | HTTP / REST (JSON & Multipart)
                                                     v
                          +-----------------------------------------------------+
                          |              FastAPI Application Gateway            |
                          |      CORS Middleware • Pydantic Contract Validation  |
                          +-----+--------------------+--------------------+-----+
                                |                    |                    |
                                v                    v                    v
                  +--------------------+ +--------------------+ +--------------------+
                  | Trip Scoring &     | | Gamification &     | | Coaching & Weekly  |
                  | CO2 Engine         | | Challenge Engine   | | Insights Engine    |
                  +--------------------+ +--------------------+ +--------------------+
                                |                    |                    |
                                +----------+---------+--------------------+
                                           |
                                           v
                          +-----------------------------------------------------+
                          |             SQLAlchemy 2.0 ORM Data Layer           |
                          |  Default: SQLite (ecodrive.db for zero-config run)  |
                          |  Production: PostgreSQL (via DATABASE_URL)          |
                          +-----------------------------------------------------+
```

---

## 4. Transparent Scoring Methodology

Unlike arbitrary or "black-box" scoring formulas, EcoDrive implements a transparent, multi-attribute utility model. The composite **Eco Score** is bounded between **15.0 and 100.0** and weighted across four key operational dimensions:

$$\text{Eco Score} = 0.30 \times S_{\text{smooth}} + 0.25 \times S_{\text{idle}} + 0.20 \times S_{\text{speed}} + 0.25 \times S_{\text{eff}}$$

### A. Smoothness Score ($S_{\text{smooth}}$, Weight: 30%)
- **Objective:** Discourage fuel-wasting aggressive throttle spikes and hard braking.
- **Metric:** Normalized harsh event rate per 10 km:
  $$\text{Harsh Rate} = \frac{\text{Harsh Accel (>2.5 m/s²)} + \text{Harsh Brake (<-2.8 m/s²)}}{\max(1.0, \text{Distance}_{\text{km}} / 10)}$$
- **Formula:** $S_{\text{smooth}} = \max(20.0, 100.0 - (\text{Harsh Rate} \times 12.0))$.

### B. Idle Efficiency Score ($S_{\text{idle}}$, Weight: 25%)
- **Objective:** Eliminate parasitic fuel burn and urban emissions during stationary stops.
- **Metric:** $\text{Idle Ratio} = \frac{\text{Idle Duration}}{\text{Total Trip Duration}}$.
- **Baseline:** Up to 5% idle time is considered normal traffic buffer (traffic signals, pedestrian crossings).
- **Formula:** If $\text{Idle Ratio} \le 0.05 \implies 100.0$; otherwise penalized proportionally:
  $$S_{\text{idle}} = \max(15.0, 100.0 - ((\text{Idle Ratio} - 0.05) \times 220.0))$$

### C. Speed Efficiency Score ($S_{\text{speed}}$, Weight: 20%)
- **Objective:** Penalize speeds where aerodynamic drag severely degrades thermal/battery efficiency.
- **Formula:** Aerodynamic drag scales quadratically with velocity ($F_{\text{drag}} \propto v^2$). When peak speed exceeds $110\text{ km/h}$, a drag penalty is deducted:
  $$\text{Penalty}_{\text{aero}} = \min(30.0, (\text{Max Speed} - 110.0) \times 1.5)$$

### D. Powertrain Energy Efficiency Score ($S_{\text{eff}}$, Weight: 25%)
- **Objective:** Evaluate actual consumption against documented vehicle category baselines.
- **Category Baselines:**
  - Petrol: $7.5\text{ L/100km}$
  - Diesel: $6.2\text{ L/100km}$
  - Hybrid: $4.5\text{ L/100km}$
  - Electric Vehicle (EV): $16.0\text{ kWh/100km}$
- **Formula:** Evaluates ratio $R = \frac{\text{Actual Rate}}{\text{Baseline Rate}}$. Achieving $\le 85\%$ of baseline awards 100 points.

### E. Human-Readable Score Drop Attribution
The engine automatically generates specific, quantitative explanations for why a driver lost points (e.g. *"Lost 12.5 pts: Idle time accounted for 14.2% of the trip (target < 5%)"*, *"Lost 6.0 pts: High speed cruise reached 124 km/h (>110 km/h aero drag threshold)"*).

---

## 5. Carbon Dioxide (CO₂) Calculation Methodology

Emissions are derived using standard environmental authority emission factors (EPA / UK DEFRA):

| Powertrain | Documented Factor | Notes |
| :--- | :--- | :--- |
| **Petrol (Gasoline)** | **2.31 kg CO₂ / Liter** | Direct combustion emission factor |
| **Diesel** | **2.68 kg CO₂ / Liter** | Higher carbon density of distillate fuel |
| **Hybrid (HEV)** | **1.42 kg CO₂ / Liter** | Effective blended factor accounting for regenerative braking |
| **Electric Vehicle (EV)** | **0.385 kg CO₂ / kWh** | Average national grid electricity generation carbon intensity |

### CO₂ Prevented / Saved Benchmark
Every trip is compared against an unoptimized typical ICE petrol benchmark ($8.5\text{ L/100km} \times 2.31\text{ kg CO₂/L}$). Cumulative savings are tracked on the user's profile and converted into tangible equivalencies (e.g. mature tree annual absorption equivalent).

---

## 6. Gamification System

1. **Experience Points (XP):**
   $$\text{Trip XP} = 50\text{ (Base)} + \max(0, (\text{Score} - 50) \times 2) + \min(30, \text{Distance} \times 1.5) + 25\text{ (Clean trip bonus)}$$
2. **5 Progressive Driver Tiers:**
   - Level 1 — **Seedling** (0 – 299 XP)
   - Level 2 — **Sprout** (300 – 799 XP)
   - Level 3 — **Green Driver** (800 – 1,599 XP)
   - Level 4 — **Eco Champion** (1,600 – 2,799 XP)
   - Level 5 — **Planet Saver** (2,800+ XP)
3. **Qualifying Streak System:**
   - Drivers earn or increment active streaks by logging at least one qualifying trip with $\text{Eco Score} \ge 65$ per calendar day.
4. **Persistent Driver Badges:**
   - *First Journey* (First trip logged)
   - *Smooth Operator* (Zero harsh accelerations and braking on a journey $\ge 5\text{ km}$)
   - *Idle Crusher* (Idling below 3% on a journey $\ge 10\text{ mins}$)
   - *Energy Prodigy* (Efficiency score $\ge 90$)
   - *Low Carbon Cruiser* (Emissions $< 1.0\text{ kg CO₂}$ on a journey $\ge 5\text{ km}$)
   - *7-Day Eco Streak* (7 consecutive qualifying driving days)
   - *Eco Champion* (Attain Level 4 driver status)
5. **Community Leaderboard:**
   - Ranks drivers by XP with tier badges, clear current-user **"YOU"** indicator, and a concise header disclosure indicating sample community data.

---

## 7. REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | System health check and database connectivity probe |
| `GET` | `/api/dashboard` | Aggregated dashboard: current score, metrics, recent trips, weekly trend |
| `GET` | `/api/trips` | Filterable driving history (vehicle type, score threshold, pagination) |
| `POST` | `/api/trips` | Ingest manual trip telemetry, compute score, and award XP/badges |
| `POST` | `/api/trips/upload` | Ingest and parse time-series telemetry CSV file |
| `GET` | `/api/trips/{id}` | In-depth trip breakdown with telemetry and deduction reasons |
| `GET` | `/api/analytics` | Historical trends, week-over-week deltas, vehicle efficiency stats |
| `GET` | `/api/challenges` | Active and completed eco challenges with live progress |
| `GET` | `/api/badges` | Showcase of driver badges with user unlock timestamps |
| `GET` | `/api/leaderboard` | Top drivers ranked by XP |
| `GET` | `/api/insights` | Weekly executive review and prioritized coaching tips |
| `GET` | `/api/compare` | Interactive EV vs ICE emissions and operational cost simulation |
| `GET` | `/api/profile` | Active driver profile, level, streak, and lifetime statistics |

---

## 8. Local Setup & Execution Guide

### Prerequisites
- **Python 3.10+** (Tested on Python 3.12)
- **Node.js 18+** & **npm**

### Step 1: Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run automated tests to verify engines and API
python -m pytest -v

# Initialize database and populate 26+ realistic trips, badges & leaderboard
python -m app.seed

# Start FastAPI backend server
python -m uvicorn app.main:app --port 8000 --reload
```
The backend will be live at `http://127.0.0.1:8000`  
Interactive OpenAPI Swagger docs: `http://127.0.0.1:8000/docs`

### Step 2: Frontend Setup
```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies (if not already installed)
npm install

# Start Vite development server
npm run dev
```
Open your browser to `http://localhost:5173`.

---

## 9. Testing & Sample Telemetry Files

EcoDrive includes three realistic, ready-to-test CSV files in the `data/` directory:
1. `data/sample_commute.csv`: Smooth, efficient suburban drive resulting in an **88+ Eco Score**.
2. `data/sample_aggressive_trip.csv`: High throttle events, harsh braking, and high speed resulting in explicit deduction reasons.
3. `data/sample_heavy_traffic.csv`: City crawl with excessive idle time illustrating idle penalties.

*Note: In the web UI, clicking "Upload CSV" provides instant 1-click test buttons that pre-load these datasets without needing to browse files.*

---

## 10. Deployment Guide (Production)

### Backend Deployment (Render)
1. Push repository to GitHub.
2. In Render, create a new **Web Service** pointing to `/backend`.
3. Build command: `pip install -r requirements.txt && python -m app.seed`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Environment Variables:
   - `DATABASE_URL`: Your Render PostgreSQL connection string (or leave empty to default to SQLite).
   - `CORS_ORIGINS`: `["https://your-frontend.vercel.app"]`

### Frontend Deployment (Vercel)
1. In Vercel, import the repository and set the root directory to `frontend`.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Environment Variables:
   - `VITE_API_BASE_URL`: `https://your-backend.onrender.com`

---

## 11. Assumptions & Limitations

- **Lifecycle vs Tailpipe Emissions:** For EV calculation, emissions reflect the generation intensity of electricity charging (using average grid intensity of $0.385\text{ kg CO₂/kWh}$). Battery manufacturing lifecycle emissions are omitted for simplicity and stated in the comparison panel.
- **Sampling Frequency:** The CSV parser assumes 1-second sampling intervals when timestamp resolution is coarse, inferring acceleration kinematic deltas smoothly.
- **Rule-based Coaching:** In adherence to the assessment constraints, coaching tips use deterministic heuristic rules rather than external LLMs to ensure 100% latency predictability and zero API cost.

---

## 12. Author & License

Built with precision for the **Full-Stack Development Internship Assessment**.  
Open-source under the MIT License.
