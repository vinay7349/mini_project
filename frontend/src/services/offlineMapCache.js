/**
 * Offline Map Tile Cache Service
 * Handles downloading, storing, and managing map tiles for offline use
 */

const DB_NAME = 'smartstay_map_cache'
const DB_VERSION = 1
const STORE_NAME = 'tiles'
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000 // 24 hours
const MAX_CACHE_SIZE_MB = 50 // Maximum cache size in MB
const TILE_SIZE_KB = 20 // Average tile size in KB

class OfflineMapCache {
  constructor() {
    this.db = null
    this.cacheRadius = 7.5 // km (between 5-10km)
  }

  async init() {
    // Check if IndexedDB is available
    if (!window.indexedDB) {
      console.warn('[MapCache] IndexedDB is not available. Offline caching will be disabled.')
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION)

        request.onerror = () => {
          console.warn('[MapCache] Failed to open IndexedDB:', request.error)
          // Don't reject, just continue without cache
          resolve()
        }
        
        request.onsuccess = () => {
          this.db = request.result
          resolve()
        }

        request.onupgradeneeded = (event) => {
          const db = event.target.result
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' })
            store.createIndex('timestamp', 'timestamp', { unique: false })
            store.createIndex('region', 'region', { unique: false })
          }
        }
      } catch (error) {
        console.warn('[MapCache] Error initializing cache:', error)
        resolve() // Continue without cache
      }
    })
  }

  /**
   * Convert lat/lon/zoom to tile coordinates
   */
  deg2num(lat, lon, zoom) {
    const n = Math.pow(2, zoom)
    const xtile = Math.floor((lon + 180) / 360 * n)
    const ytile = Math.floor(
      (1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2 * n
    )
    return { x: xtile, y: ytile, z: zoom }
  }

  /**
   * Get bounding box for tiles to cache around a location
   */
  getTilesForRegion(lat, lon, radiusKm = 7.5) {
    const zoomLevels = [13, 14, 15] // Cache multiple zoom levels
    const tiles = new Set()

    // Calculate bounding box
    const latDelta = radiusKm / 111 // ~111 km per degree latitude
    const lonDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180))

    const minLat = lat - latDelta
    const maxLat = lat + latDelta
    const minLon = lon - lonDelta
    const maxLon = lon + lonDelta

    zoomLevels.forEach(zoom => {
      const minTile = this.deg2num(minLat, minLon, zoom)
      const maxTile = this.deg2num(maxLat, maxLon, zoom)

      for (let x = minTile.x; x <= maxTile.x; x++) {
        for (let y = minTile.y; y <= maxTile.y; y++) {
          tiles.add(`${zoom}/${x}/${y}`)
        }
      }
    })

    return Array.from(tiles)
  }

  /**
   * Download and cache tiles for a region
   */
  async cacheRegion(lat, lon, radiusKm = null) {
    if (!this.db) await this.init()

    const radius = radiusKm || this.cacheRadius
    const regionId = `${lat.toFixed(2)}_${lon.toFixed(2)}_${radius}`
    const tiles = this.getTilesForRegion(lat, lon, radius)

    console.log(`[MapCache] Caching ${tiles.length} tiles for region ${regionId}`)

    const cachePromises = tiles.map(tileKey => this.cacheTile(tileKey, regionId))
    await Promise.allSettled(cachePromises)

    // Clean up old regions
    await this.cleanupExpiredTiles()

    return { cached: tiles.length, region: regionId }
  }

  /**
   * Cache a single tile
   */
  async cacheTile(tileKey, regionId) {
    if (!this.db) await this.init()

    const [z, x, y] = tileKey.split('/')
    const tileUrl = `https://tile.openstreetmap.org/${z}/${x}/${y}.png`

    try {
      // Check if already cached and not expired
      const existing = await this.getTile(tileKey)
      if (existing && !this.isExpired(existing.timestamp)) {
        return existing
      }

      // Download tile
      const response = await fetch(tileUrl)
      if (!response.ok) throw new Error(`Failed to fetch tile: ${response.status}`)

      const blob = await response.blob()
      const arrayBuffer = await blob.arrayBuffer()

      // Store in IndexedDB
      const tileData = {
        key: tileKey,
        data: arrayBuffer,
        timestamp: Date.now(),
        region: regionId,
        url: tileUrl,
      }

      const transaction = this.db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      await store.put(tileData)

      return tileData
    } catch (error) {
      console.warn(`[MapCache] Failed to cache tile ${tileKey}:`, error)
      return null
    }
  }

  /**
   * Get cached tile
   */
  async getTile(tileKey) {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(tileKey)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get tile URL (cached or online)
   */
  async getTileUrl(z, x, y) {
    // If no database, always return online URL
    if (!this.db) {
      return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`
    }

    try {
      const tileKey = `${z}/${x}/${y}`
      const cached = await this.getTile(tileKey)

      if (cached && !this.isExpired(cached.timestamp)) {
        // Return blob URL for cached tile
        const blob = new Blob([cached.data], { type: 'image/png' })
        return URL.createObjectURL(blob)
      }
    } catch (error) {
      console.warn('[MapCache] Error getting cached tile:', error)
    }

    // Return online URL as fallback
    return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`
  }

  /**
   * Check if tile is expired
   */
  isExpired(timestamp) {
    return Date.now() - timestamp > CACHE_DURATION_MS
  }

  /**
   * Clean up expired tiles
   */
  async cleanupExpiredTiles() {
    if (!this.db) await this.init()

    const transaction = this.db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const index = store.index('timestamp')
    const cutoffTime = Date.now() - CACHE_DURATION_MS

    return new Promise((resolve, reject) => {
      const request = index.openCursor(IDBKeyRange.upperBound(cutoffTime))

      request.onsuccess = (event) => {
        const cursor = event.target.result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        } else {
          resolve()
        }
      }

      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.count()

      request.onsuccess = () => {
        const count = request.result
        const sizeMB = (count * TILE_SIZE_KB) / 1024
        resolve({
          tileCount: count,
          estimatedSizeMB: sizeMB.toFixed(2),
          maxSizeMB: MAX_CACHE_SIZE_MB,
        })
      }

      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Clear all cached tiles
   */
  async clearCache() {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
}

// Export singleton instance
export default new OfflineMapCache()

