import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheItem<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

/**
 * CacheManager - Utility for caching data with TTL (Time To Live)
 * 
 * Usage:
 * - await CacheManager.set('key', data, 5); // Cache for 5 minutes
 * - const data = await CacheManager.get<DataType>('key');
 * - await CacheManager.clear('key');
 */
export class CacheManager {
    /**
     * Store data in cache with TTL
     * @param key Cache key
     * @param data Data to cache
     * @param ttlMinutes Time to live in minutes (default: 5)
     */
    static async set<T>(key: string, data: T, ttlMinutes: number = 5): Promise<void> {
        try {
            const item: CacheItem<T> = {
                data,
                timestamp: Date.now(),
                ttl: ttlMinutes * 60 * 1000
            };
            await AsyncStorage.setItem(key, JSON.stringify(item));
        } catch (error) {
            console.error(`CacheManager.set error for key "${key}":`, error);
        }
    }

    /**
     * Get data from cache if not expired
     * @param key Cache key
     * @returns Cached data or null if not found/expired
     */
    static async get<T>(key: string): Promise<T | null> {
        try {
            const cached = await AsyncStorage.getItem(key);
            if (!cached) return null;

            const item: CacheItem<T> = JSON.parse(cached);
            const age = Date.now() - item.timestamp;

            // Check if cache is expired
            if (age > item.ttl) {
                await AsyncStorage.removeItem(key);
                return null;
            }

            return item.data;
        } catch (error) {
            console.error(`CacheManager.get error for key "${key}":`, error);
            return null;
        }
    }

    /**
     * Clear specific cache entry
     * @param key Cache key to clear
     */
    static async clear(key: string): Promise<void> {
        try {
            await AsyncStorage.removeItem(key);
        } catch (error) {
            console.error(`CacheManager.clear error for key "${key}":`, error);
        }
    }

    /**
     * Clear all cache entries
     */
    static async clearAll(): Promise<void> {
        try {
            await AsyncStorage.clear();
        } catch (error) {
            console.error('CacheManager.clearAll error:', error);
        }
    }

    /**
     * Check if cache exists and is valid
     * @param key Cache key
     * @returns true if cache exists and is valid
     */
    static async has(key: string): Promise<boolean> {
        const data = await this.get(key);
        return data !== null;
    }
}

// Cache keys constants
export const CACHE_KEYS = {
    PATIENT_DASHBOARD: 'patient_dashboard',
    OPTOMETRIST_DASHBOARD: 'optometrist_dashboard',
    MEDICAL_RECORD: (patientId: string) => `medical_${patientId}`,
    APPOINTMENTS: 'appointments',
    COMMISSION: 'commission',
};
