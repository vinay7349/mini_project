# 🧭 SmartStay Navigator – AI-Powered Travel Companion

A full-stack AI travel web application that helps users find hostels, discover attractions, access emergency help, translate languages, view offline maps, and connect with other travelers through public events — all in one platform.

## 🌟 Features

### 🗺️ Core Features

1. **Offline Map & Stay Finder**
   - Leaflet + OpenStreetMap integration
   - Find hostels, ATMs, restaurants, hospitals
   - Download maps for offline use
   - Filter by distance, price, or rating

2. **Nearby Attractions**
   - Auto-detect GPS location
   - Display tourist spots with descriptions and images
   - "🎁 Surprise Me" feature for hidden/local gems

3. **Emergency Helpline**
   - Shows emergency contacts based on location (Police, Fire, Ambulance, Women Helpline)
   - Quick "Call Now" button

4. **Voice Translator**
   - Real-time text ↔ voice translation via Web Speech API
   - Conversation helper for travelers talking to locals

5. **Local Buzz Feed**
   - AI-curated local updates, news, weather, and nearby activities

6. **Public Events & Travel Community Hub** ✨
   - Event Board: Travelers and locals can post public events
   - Event details: Title, description, location, date/time, tags, organizer contact
   - Comment and mark interest ("I'm going!")
   - AI Event Assistant for suggestions and moderation
   - Offline Event Viewer

### 🧠 AI Features

- **AI Travel Assistant Chatbot**: Helps with trip planning, directions, and solving travel problems
- **AI Travel Story Mode**: Narrates short stories/history about tourist spots
- **Local Culture Card**: Random facts about local life
- **AR Exploration (WebXR)**: Point camera → see overlay info about nearby spots
- **Offline Mode Alert**: Smart alert showing cached data and AI tips when offline
- **Voice AI Mode**: Speak to the AI assistant
- **Smart Itinerary Generator**: AI builds custom day plans

## 🧱 Tech Stack

- **Frontend**: React + TailwindCSS + Leaflet.js + Web Speech API + WebXR
- **Backend**: Flask (Python) + Flask-SQLAlchemy + Flask-CORS
- **Database**: SQLite (can later upgrade to PostgreSQL)
- **AI Layer**: OpenAI GPT API (or local mock AI for offline mode)

## 🚀 Setup & Installation

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Copy the sample environment file and update it with your MongoDB credentials:
```bash
copy env.example .env        # Windows
# or
cp env.example .env          # macOS/Linux
```
Then edit `.env` to set `SECRET_KEY`, `MONGO_URI`, and `MONGO_DB_NAME`. The login and profile APIs rely on these values to talk to MongoDB.
You can also set `TOKEN_SALT`, `TOKEN_EXP_SECONDS`, and any AI keys (like `GOOGLE_API_KEY`) now so authentication tokens and AI routes pick up the right credentials automatically.

5. Run the Flask server:
```bash
python app.py
```

The backend will be running on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
# or
npm run dev
```

The frontend will be running on `http://localhost:3000`

## 📁 Project Structure

```
smartstay-navigator/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── models.py              # Database models
│   ├── ai_helper.py           # AI helper functions
│   ├── requirements.txt       # Python dependencies
│   ├── routes/
│   │   ├── stays_routes.py    # Stays API endpoints
│   │   ├── tourist_routes.py  # Tourist spots API endpoints
│   │   ├── emergency_routes.py # Emergency contacts API
│   │   ├── culture_routes.py  # Culture facts API
│   │   ├── events_routes.py   # Events & community API
│   │   └── ai_routes.py       # AI chatbot API
│   └── database.sqlite        # SQLite database (created automatically)
│
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   │   ├── MapView.js
│   │   │   ├── EventCard.js
│   │   │   ├── EventForm.js
│   │   │   ├── Translator.js
│   │   │   ├── EmergencyPanel.js
│   │   │   ├── CultureCard.js
│   │   │   ├── AIChatBox.js
│   │   │   ├── ARView.js
│   │   │   └── OfflineAlert.js
│   │   ├── pages/             # Page components
│   │   │   ├── Dashboard.js
│   │   │   ├── Places.js
│   │   │   ├── Stays.js
│   │   │   ├── Events.js
│   │   │   ├── AIChat.js
│   │   │   └── Translator.js
│   │   ├── services/
│   │   │   └── api.js          # API service layer
│   │   ├── App.jsx            # Main App component
│   │   └── main.jsx           # Entry point
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## 🔑 API Endpoints

### Stays
- `GET /api/stays` - Get all stays (with optional filters)
- `GET /api/stays/:id` - Get specific stay
- `POST /api/stays` - Create new stay

### Tourist Spots
- `GET /api/tourist-spots` - Get all tourist spots
- `GET /api/tourist-spots/:id` - Get specific spot
- `POST /api/tourist-spots` - Create new spot

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get specific event with comments
- `POST /api/events` - Create new event
- `POST /api/events/:id/interest` - Mark interest in event
- `POST /api/events/:id/comments` - Add comment to event
- `GET /api/events/suggest` - AI-suggested events

### Emergency
- `GET /api/emergency` - Get emergency contacts by country

### Culture
- `GET /api/culture` - Get random culture fact
- `GET /api/culture/story/:place_name` - Get travel story about place
- `GET /api/buzz-feed` - Get local buzz feed

### AI
- `POST /api/ai/chat` - AI chatbot
- `POST /api/ai/itinerary` - Generate travel itinerary
- `POST /api/ai/event-create` - AI-assisted event creation

## 🎨 UI Features

- **Sidebar Navigation**: Home, Map, Stay, Explore, Translator, Emergency, AI Chat, Culture, Events
- **Responsive Design**: Works on Mobile + Desktop
- **Vibrant Theme**: Purple/indigo gradient theme
- **Floating AI Help Button**: Accessible on all pages
- **Offline Banner**: Shows when using cached data



### Creating an Event

1. Navigate to the Events page
2. Click "Create Event"
3. Fill in the event details
4. Use "🤖 Get AI Help" to get AI-suggested title and description
5. Submit the event

### Using the Translator

1. Go to Translator page
2. Select source and target languages
3. Type or use microphone to speak
4. Click "Translate" or let it auto-translate
5. Click "🔊 Play" to hear the translation

### Finding Stays

1. Go to Stays page
2. Set filters (max price, min rating, distance)
3. View results on map and in list
4. Click "Call Now" to contact directly


## 🙏 Acknowledgments

- OpenStreetMap for map data
- Leaflet.js for map integration
- React community for excellent libraries

---

Built with ❤️ for travelers worldwide

