# Body Quest 🫀

**Journey Inside the Human Body** — an interactive NCERT Class 9–10 biology learning game built for the UTMT Learning Portal.

Students help patient **Rohan** heal organ by organ across four progressive levels: identify organ functions, match diseases, choose healing foods, and diagnose symptoms — all on an interactive, responsive body map.

🔗 **GitHub:** [github.com/Rakshita-0206/Body-Quest](https://github.com/Rakshita-0206/Body-Quest)

---

## 📖 Game Concept & Levels

Body Quest turns NCERT nutrition and anatomy concepts into an engaging, streak-based body-map click challenge. Rohan, the patient, is feeling unwell, and the player must diagnose and heal Rohan organ-by-organ across **four levels**:

| Level | Title | Focus / Learning Objective | Mode |
|:---:|---|---|:---:|
| **Level 1** | **Organ Identification** | Match foundational organ functions to the correct location. | Interactive Map Click |
| **Level 2** | **Disease Matching** | Connect disease descriptions & conditions to the affected organs. | Interactive Map Click |
| **Level 3** | **Food Matching** | Identify key nutrients & healing foods that support specific organs. | Interactive Map Click |
| **Level 4** | **Symptom Diagnosis** | Evaluate complex clinical symptoms and diagnose the target organ. | Interactive Map Click |

The game is designed for self-guided learning. Progress is saved locally via `localStorage` and `sessionStorage` in the browser. There is **no external database** required.

---

## 🛠️ Tech Stack

- **Frontend:** HTML5 (semantic layout), Vanilla CSS3 (custom layouts, typography, responsive styling, screen-scaling utilities), Vanilla JavaScript (modules, state machine, canvas-based confetti / toast components)
- **Backend:** Python 3.8+, FastAPI, Uvicorn, Dotenv, CORS middleware
- **Data Model:** Static JSON configs for local game state validation and client bundling.

---

## ⚡ Quick Start

The game files are fully integrated within the FastAPI layout under `templates/body_quest_templates/`.

### Option 1 — Easy Startup (Windows)
1. Double-click the **[run.bat](file:///Users/pawankushwah/Downloads/Body-Quest%204/run.bat)** file in the root directory.
2. Open your web browser and navigate to **[http://127.0.0.1:8000/body-quest/](http://127.0.0.1:8000/body-quest/)**.

### Option 2 — Terminal (macOS / Linux / Windows)
1. Open your terminal in the project directory.
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the application entry point:
   ```bash
   python main.py
   ```
4. Open your web browser and navigate to **[[http://127.0.0.1:8000/body-quest/](http://127.0.0.1:8000/body-quest/)](https://www.utmt.org/body-quest/)**.

> [!WARNING]
> Do **NOT** attempt to open `index.html` directly or run a local Python HTTP server (`python -m http.server`) inside the templates directory. The frontend requires the FastAPI URL routing context (`/body-quest/`) to resolve asset URLs and backend endpoints properly.

---

## 📂 Project Structure

```text
Body-Quest/
├── main.py                         # FastAPI server & portal entry point
├── requirements.txt                # Python package dependencies
├── render.yaml                     # Render deployment configuration
├── run.bat                         # Windows quick launch script
├── app/
│   └── body_quest/
│       ├── __init__.py
│       ├── routes.py               # REST API endpoints (/body-quest/api/*)
│       ├── gamedata.py             # Loads static JSON data at startup
│       └── data/                   # Game content JSON files (for backend)
│           ├── patient.json        # Patient profile (name, age, overall symptoms)
│           ├── organs.json         # Organ attributes & diagnostic cues
│           ├── levels.json         # Level configurations & minimum scores
│           └── quizzes.json        # MCQ definitions per level
└── templates/
    └── body_quest_templates/       # Web UI codebase
        ├── index.html              # Main game layout and script mounts
        ├── config.js               # API URL resolver and configurations
        ├── style.css               # Core visual styling & responsive rules
        ├── level1-mobile.css       # Mobile-specific layout overrides
        ├── ui-scale.css            # Screen-scaling system for varying viewports
        ├── typography.css          # Text and font structures
        ├── organs.js               # Global declarations of organs
        ├── js/                     # Component modules
        │   ├── init.js             # Initial state runner
        │   ├── state.js            # Reactive game state machine
        │   ├── helpers.js          # Shared utility and scoring helper methods
        │   ├── navigation.js       # SPA screen routing
        │   ├── body-map.js         # Interactive body-map SVG handlers & hotspots
        │   ├── persistence.js      # Progress saving / load routines
        │   ├── levels/
        │   │   └── map-click.js    # Interactive Level 1-4 game logic
        │   ├── screens/
        │   │   └── level-select.js # Map-select and level selector board
        │   └── ui/
        │       ├── confetti.js     # Victory effect
        │       └── toast.js        # Notification bubble drawer
        ├── data/                   # Game JSON data (for frontend)
        │   ├── level1-questions.json
        │   ├── level2-questions.json
        │   ├── level3-questions.json
        │   ├── level4-questions.json
        │   ├── patient.json
        │   ├── organs-core.json
        │   ├── organ-hotspots.json
        │   ├── levels-config.json
        │   ├── organs-qa-data.js   # Compiled bundle of questions (auto-generated)
        │   └── organs-shared-data.js# Compiled bundle of shared config (auto-generated)
        └── scripts/                # Build and synchronization scripts
            ├── sync-organs-qa.mjs  # Compiles level*-questions.json into JS
            ├── sync-organs-shared.mjs # Compiles core config JSONs into JS
            └── verify-score-sync.mjs # Validates scoring and persistence rules
```

---

## ✏️ Modifying Game Content & Syncing

The game question and configuration data is stored in the frontend directory `templates/body_quest_templates/data/`. If you modify these files, you need to run Node.js compilation scripts to bundle them into JavaScript format for the client.

### Modifying Level Questions
Edit these JSON files:
- [level1-questions.json](file:///Users/pawankushwah/Downloads/Body-Quest%204/templates/body_quest_templates/data/level1-questions.json)
- [level2-questions.json](file:///Users/pawankushwah/Downloads/Body-Quest%204/templates/body_quest_templates/data/level2-questions.json)
- [level3-questions.json](file:///Users/pawankushwah/Downloads/Body-Quest%204/templates/body_quest_templates/data/level3-questions.json)
- [level4-questions.json](file:///Users/pawankushwah/Downloads/Body-Quest%204/templates/body_quest_templates/data/level4-questions.json)

Then sync them by running:
```bash
cd templates/body_quest_templates
node scripts/sync-organs-qa.mjs
```

### Modifying Game Configs
Edit these core configuration files:
- [patient.json](file:///Users/pawankushwah/Downloads/Body-Quest%204/templates/body_quest_templates/data/patient.json)
- [organs-core.json](file:///Users/pawankushwah/Downloads/Body-Quest%204/templates/body_quest_templates/data/organs-core.json)
- [organ-hotspots.json](file:///Users/pawankushwah/Downloads/Body-Quest%204/templates/body_quest_templates/data/organ-hotspots.json)
- [levels-config.json](file:///Users/pawankushwah/Downloads/Body-Quest%204/templates/body_quest_templates/data/levels-config.json)

Then sync them by running:
```bash
cd templates/body_quest_templates
node scripts/sync-organs-shared.mjs
```

### Verification Scripts
To verify consistency in scoring logic, run:
```bash
cd templates/body_quest_templates
node scripts/verify-score-sync.mjs
```

---

## 📡 Backend API Endpoints

FastAPI exposes these HTTP endpoints for optional data fetching and status monitoring:

| Method | Endpoint | Description |
|:---:|---|---|
| **GET** | `/body-quest/` | Main frontend game UI router |
| **GET** | `/body-quest/api/gamedata?level={id}` | Fetches static patient, organ list, and quiz metadata for a specific level |
| **GET** | `/body-quest/api/levels` | Retrieves available levels status |
| **GET** | `/body-quest/api/health` | Game service health check |
| **GET** | `/health` | Core portal service health check |

---

## 📄 License

Educational use under the UTMT Learning Portal.
