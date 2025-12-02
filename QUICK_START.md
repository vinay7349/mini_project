# Quick Start Guide - SmartStay Navigator

## 🚀 Getting Everything Running

### Prerequisites
- Python 3.8+ installed
- Node.js 16+ installed
- MongoDB Atlas account (or local MongoDB)

### Step 1: Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment (if not exists):**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create .env file:**
   Create a `.env` file in the `backend/` directory with:
   ```env
   SECRET_KEY=your-secret-key-here
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
   MONGO_DB_NAME=your_database_name
   TOKEN_SALT=your-token-salt
   TOKEN_EXP_SECONDS=86400
   GOOGLE_API_KEY=your-google-api-key
   FLASK_APP=app.py
   FLASK_ENV=development
   ```

5. **Start the backend server:**
   ```bash
   python app.py
   ```
   
   You should see:
   ```
   [STARTING] SmartStay Navigator API...
   [OK] MongoDB: Connected to 'your_database'
   * Running on http://127.0.0.1:5000
   ```

### Step 2: Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   The frontend will be available at `http://localhost:5173` (or similar port)

### Step 3: Access the Application

1. **Open your browser** and go to `http://localhost:5173`

2. **Navigate to Enhanced Places:**
   - Click on "Places" in the sidebar, OR
   - Go directly to `http://localhost:5173/places/enhanced`

3. **Allow location access** when prompted by your browser

4. **You should see:**
   - Nearest Places section (top 3 closest)
   - Best Places section (top rated)
   - Interactive map with your location
   - AI-powered suggestions (when category is selected)

## ✅ Verification Checklist

- [ ] Backend server running on port 5000
- [ ] Frontend server running (usually port 5173)
- [ ] MongoDB connection successful (check backend console)
- [ ] Browser location permission granted
- [ ] Nearest places showing automatically
- [ ] Map displaying correctly
- [ ] No console errors in browser DevTools

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Failed:**
- Check your `.env` file has correct `MONGO_URI`
- Verify MongoDB Atlas IP whitelist includes your IP
- Check network connection

**Port 5000 Already in Use:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill
```

### Frontend Issues

**Dependencies Not Installing:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Map Not Showing:**
- Check browser console for errors
- Verify Leaflet CSS is loading (check Network tab)
- Ensure location permission is granted

**Nearest Places Not Showing:**
- Grant browser location permission
- Check browser console for geolocation errors
- Verify places exist in database with coordinates

### Common Errors

**"Module not found" errors:**
- Run `npm install` again in frontend directory
- Run `pip install -r requirements.txt` in backend directory

**CORS errors:**
- Ensure backend CORS is enabled (already configured)
- Check backend is running on port 5000

**Location permission denied:**
- Use HTTPS or localhost (required for geolocation)
- Check browser settings for location permissions

## 📝 Testing the Features

1. **Test Nearest Places:**
   - Go to `/places/enhanced`
   - Allow location access
   - Should see "Nearest Places to You" section automatically

2. **Test AI Suggestions:**
   - Select a category (Hotels, Restaurants, etc.)
   - Should see AI-powered suggestions appear

3. **Test Route Display:**
   - Click on any place
   - Route should appear on map

4. **Test Offline Caching:**
   - Wait for map tiles to cache (see "Caching map tiles..." message)
   - Turn off internet
   - Map should still work with cached tiles

## 🎯 Next Steps

- Add more places to database via API or admin panel
- Customize AI preferences in the Enhanced Places page
- Test offline functionality
- Explore other features (Events, Stays, Translator, etc.)

## 📞 Need Help?

- Check browser console (F12) for errors
- Check backend terminal for server errors
- Verify all environment variables are set correctly
- Ensure all dependencies are installed

