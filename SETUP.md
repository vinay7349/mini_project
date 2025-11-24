# Quick Setup Guide

## Prerequisites

- **Python 3.8+**: [Download Python](https://www.python.org/downloads/)
- **Node.js 16+**: [Download Node.js](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**

## Step-by-Step Setup

### 1. Clone or Download the Project

```bash
# If using git
git clone <repository-url>
cd smartstay-navigator

# Or just navigate to the project directory
cd D:\projjjj
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# (Optional) Seed sample data
python seed_data.py

# Run the Flask server
python app.py
```

The backend should now be running on `http://localhost:5000`

### 3. Frontend Setup

Open a **new terminal window** (keep backend running):

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm start
# or
npm run dev
```

The frontend should now be running on `http://localhost:3000`

### 4. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

You should see the SmartStay Navigator dashboard!

## Troubleshooting

### Backend Issues

**Port 5000 already in use:**
- Change port in `backend/app.py`: `app.run(debug=True, port=5001)`
- Update frontend proxy in `frontend/vite.config.js`

**Database errors:**
- Delete `backend/database.sqlite` and restart the Flask app
- Run `python seed_data.py` to add sample data

**Module not found errors:**
- Make sure virtual environment is activated
- Run `pip install -r requirements.txt` again

### Frontend Issues

**Port 3000 already in use:**
- Vite will automatically use the next available port
- Check terminal for the actual port number

**Dependencies not installing:**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

**Map not showing:**
- Check browser console for errors
- Make sure backend is running
- Check if you have internet connection (for map tiles)

## Environment Variables (Optional)

Create a `.env` file in the `backend` directory for OpenAI API:

```
OPENAI_API_KEY=your-api-key-here
```

The app works without this - it will use mock AI responses.

## Next Steps

1. **Explore the Features:**
   - Visit different pages from the sidebar
   - Try creating an event
   - Test the AI chatbot
   - Use the translator

2. **Add Your Data:**
   - Use the API endpoints or UI to add stays
   - Create tourist spots
   - Post events

3. **Customize:**
   - Modify colors in `frontend/tailwind.config.js`
   - Add more emergency contacts in `backend/routes/emergency_routes.py`
   - Customize AI responses in `backend/ai_helper.py`

## Production Deployment

For production:

1. **Backend:**
   - Use a production WSGI server (gunicorn, uWSGI)
   - Set `debug=False` in Flask app
   - Use PostgreSQL instead of SQLite
   - Set environment variables securely

2. **Frontend:**
   - Run `npm run build`
   - Serve the `dist` folder with a web server (nginx, Apache)
   - Configure API URL in production environment

Happy Traveling! 🧭✈️

