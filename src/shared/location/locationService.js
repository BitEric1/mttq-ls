import { getLocation } from 'zmp-sdk/apis'

const DEFAULT_LOCATION = {
    latitude: 21.8485,
    longitude: 106.7578,
}

const LOCATION_CACHE_TIME = 15000

let lastLocationCache = null
let lastFetchTime = 0
let pendingPromise = null

export const isValidCoordinate = (lat, lng) => {
    return (
        typeof lat === 'number' &&
        typeof lng === 'number' &&
        !Number.isNaN(lat) &&
        !Number.isNaN(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
    )
}

const buildLocationResponse = ({
    success,
    source,
    latitude,
    longitude,
    accuracy = 0,
    permissionDenied = false,
}) => ({
    success,
    source,
    latitude,
    longitude,
    accuracy,
    permissionDenied,
    fetchedAt: Date.now(),
})

export const getCurrentLocation = async ({ forceRefresh = false } = {}) => {
    /**
     * =========================
     * CACHE
     * =========================
     */
    const now = Date.now()

    if (
        !forceRefresh &&
        lastLocationCache &&
        now - lastFetchTime < LOCATION_CACHE_TIME
    ) {
        return lastLocationCache
    }

    /**
     * =========================
     * CHỐNG REQUEST SONG SONG
     * =========================
     */
    if (pendingPromise) {
        return pendingPromise
    }

    pendingPromise = (async () => {
        /**
         * =========================
         * 1. ZALO SDK GPS
         * =========================
         */
        try {
            const location = await getLocation({})

            if (isValidCoordinate(location?.latitude, location?.longitude)) {
                const response = buildLocationResponse({
                    success: true,
                    source: 'zalo-sdk',
                    latitude: location.latitude,
                    longitude: location.longitude,
                    accuracy: location.accuracy || 0,
                })

                lastLocationCache = response
                lastFetchTime = Date.now()

                return response
            }
        } catch (error) {
            console.warn('[LocationService] Zalo SDK GPS failed')
        }

        /**
         * =========================
         * 2. BROWSER GPS
         * =========================
         */
        if (navigator.geolocation) {
            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: false,
                        timeout: 5000,
                        maximumAge: 300000,
                    })
                })

                const lat = position.coords.latitude
                const lng = position.coords.longitude

                if (isValidCoordinate(lat, lng)) {
                    const response = buildLocationResponse({
                        success: true,
                        source: 'browser-gps',
                        latitude: lat,
                        longitude: lng,
                        accuracy: position.coords.accuracy || 0,
                    })

                    lastLocationCache = response
                    lastFetchTime = Date.now()

                    return response
                }
            } catch (error) {
                console.warn('[LocationService] Browser GPS failed')

                if (error?.code === 1) {
                    return buildLocationResponse({
                        success: false,
                        source: 'permission-denied',
                        latitude: DEFAULT_LOCATION.latitude,
                        longitude: DEFAULT_LOCATION.longitude,
                        permissionDenied: true,
                    })
                }
            }
        }

        /**
         * =========================
         * 3. FALLBACK
         * =========================
         */
        return buildLocationResponse({
            success: false,
            source: 'fallback',
            latitude: DEFAULT_LOCATION.latitude,
            longitude: DEFAULT_LOCATION.longitude,
        })
    })()

    try {
        return await pendingPromise
    } finally {
        pendingPromise = null
    }
}
