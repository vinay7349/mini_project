# Offline Map Testing Guide

## How to Test Offline Map Functionality

### Method 1: Browser DevTools (Easiest)

#### Step 1: Open Browser DevTools
1. Open your app in the browser
2. Press `F12` or `Right-click → Inspect`
3. Go to the **Console** tab

#### Step 2: Check Cache Initialization
Look for these messages in the console:
- `[MapCache] Caching X tiles for region...` - Shows tiles are being cached
- `[MapView] Cache initialization failed` - If you see this, IndexedDB might not be available

#### Step 3: Check IndexedDB Storage
1. In DevTools, go to **Application** tab (Chrome) or **Storage** tab (Firefox)
2. Expand **IndexedDB** in the left sidebar
3. Look for `smartstay_map_cache` database
4. Expand it and check the `tiles` object store
5. You should see cached tiles with keys like `13/1234/5678`

#### Step 4: Test Offline Mode
1. In DevTools, go to **Network** tab
2. Find the **Throttling** dropdown (usually says "No throttling")
3. Select **Offline** from the dropdown
4. OR use the **Application** tab → **Service Workers** → Check "Offline" checkbox
5. Refresh the page or navigate to the map
6. The map should still display if tiles were cached

### Method 2: Chrome DevTools Network Throttling

1. Open DevTools (`F12`)
2. Go to **Network** tab
3. Click the throttling dropdown (top toolbar)
4. Select **Offline**
5. Navigate to the Enhanced Places page (`/places/enhanced`)
6. The map should show cached tiles

### Method 3: Check Cache Status in Console

Open the browser console and run:

```javascript
// Check if cache is initialized
import offlineMapCache from './services/offlineMapCache'
offlineMapCache.getCacheStats().then(stats => {
  console.log('Cache Stats:', stats)
})
```

Or use the global window object (if available):
```javascript
// In browser console
window.offlineMapCache?.getCacheStats().then(console.log)
```

### Method 4: Visual Indicators

When the map is working correctly, you should see:

1. **Online Mode:**
   - Map loads normally
   - No special indicators

2. **Caching in Progress:**
   - Yellow/blue indicator: "⬇️ Caching map tiles..."
   - Console shows: `[MapCache] Caching X tiles for region...`

3. **Cached Tiles Available:**
   - Green indicator: "✅ X tiles cached"
   - This appears after caching completes

4. **Offline Mode:**
   - Yellow indicator: "📴 Offline Mode - Using cached maps"
   - Map should still display (if tiles were cached)

### Method 5: Manual Network Disconnection

1. **Windows:**
   - Open Network Settings
   - Disable WiFi/Ethernet
   - Or use Airplane Mode

2. **Mac:**
   - Turn off WiFi from menu bar
   - Or use Airplane Mode

3. **Mobile:**
   - Enable Airplane Mode
   - Or disable mobile data

4. Then refresh the page and check if the map still loads

### Method 6: Check Browser Console for Errors

Look for these in the console:

✅ **Good signs:**
- `[MapCache] Caching X tiles for region...`
- `[OK] MongoDB connected successfully`
- No red error messages

❌ **Warning signs:**
- `IndexedDB is not available` - Browser doesn't support IndexedDB
- `Failed to cache tile` - Network issues or CORS problems
- `Cache initialization failed` - IndexedDB permission denied

### Expected Behavior

#### When Online:
1. Map loads normally from OpenStreetMap
2. Tiles are automatically cached in background (around your location)
3. Console shows caching progress
4. Status indicator shows "X tiles cached"

#### When Going Offline:
1. Browser detects offline status
2. Yellow indicator appears: "📴 Offline Mode"
3. Map continues to show cached tiles
4. New areas (not cached) may show blank tiles

#### Cache Details:
- **Cache Radius:** 7.5 km (5-10 km range)
- **Zoom Levels:** 13, 14, 15
- **Cache Duration:** 24 hours
- **Max Cache Size:** 50 MB

### Troubleshooting

#### Map doesn't work offline:
1. **Check if tiles were cached:**
   - Look in IndexedDB (Application tab)
   - Check console for caching messages

2. **Check browser support:**
   - IndexedDB should be available in modern browsers
   - Try a different browser (Chrome, Firefox, Edge)

3. **Check permissions:**
   - Some browsers block IndexedDB in private/incognito mode
   - Try in normal browsing mode

4. **Clear and retry:**
   - Clear browser cache
   - Refresh the page
   - Wait for tiles to cache again

#### Cache not working:
1. **Check console errors**
2. **Verify IndexedDB is enabled:**
   ```javascript
   // In console
   console.log('IndexedDB available:', !!window.indexedDB)
   ```

3. **Check network requests:**
   - In Network tab, look for tile requests to `tile.openstreetmap.org`
   - These should succeed when online

### Quick Test Script

Add this to your browser console on the Enhanced Places page:

```javascript
// Test offline map cache
(async () => {
  console.log('=== Offline Map Cache Test ===');
  
  // Check IndexedDB support
  console.log('IndexedDB available:', !!window.indexedDB);
  
  // Check if cache database exists
  const dbName = 'smartstay_map_cache';
  const request = indexedDB.open(dbName);
  
  request.onsuccess = () => {
    const db = request.result;
    const transaction = db.transaction(['tiles'], 'readonly');
    const store = transaction.objectStore('tiles');
    const countRequest = store.count();
    
    countRequest.onsuccess = () => {
      console.log(`✅ Cached tiles: ${countRequest.result}`);
      console.log(`📊 Estimated size: ${(countRequest.result * 20 / 1024).toFixed(2)} MB`);
    };
  };
  
  request.onerror = () => {
    console.log('❌ Could not access cache database');
  };
  
  // Check online status
  console.log('🌐 Online status:', navigator.onLine);
  
  // Check if location is available
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => console.log('📍 Location:', pos.coords.latitude, pos.coords.longitude),
      () => console.log('❌ Location not available')
    );
  }
})();
```

### What to Look For

✅ **Success Indicators:**
- IndexedDB database `smartstay_map_cache` exists
- `tiles` object store has entries
- Console shows caching messages
- Status indicators appear on map
- Map works when network is disabled

❌ **Failure Indicators:**
- No IndexedDB database
- Console errors about cache
- Map shows blank tiles when offline
- No status indicators

