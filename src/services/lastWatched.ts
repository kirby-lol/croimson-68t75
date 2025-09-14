import { v4 as uuidv4 } from 'uuid';
import { LastWatched } from '../types';
import { supabase } from './supabase';

const STORAGE_KEY = 'crimson_last_watched';
const DEVICE_ID_KEY = 'crimson_device_id';

export const lastWatchedService = {
  getDeviceId(): string {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = uuidv4();
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  },

  // Guest mode (localStorage)
  async getGuestLastWatched(): Promise<LastWatched[]> {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  async saveGuestLastWatched(item: Omit<LastWatched, 'id'>): Promise<void> {
    const existing = await this.getGuestLastWatched();
    const existingIndex = existing.findIndex(
      w => w.tmdb_id === item.tmdb_id && w.item_type === item.item_type
    );

    const watchedItem: LastWatched = {
      ...item,
      id: uuidv4(),
      updated_at: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      existing[existingIndex] = watchedItem;
    } else {
      existing.unshift(watchedItem);
    }

    // Keep only last 20 items
    existing.splice(20);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  },

  // User mode (Supabase)
  async getUserLastWatched(userId: string): Promise<LastWatched[]> {
    const { data, error } = await supabase
      .from('last_watched')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data || [];
  },

  async saveUserLastWatched(userId: string, item: Omit<LastWatched, 'id'>): Promise<void> {
    const { error } = await supabase
      .from('last_watched')
      .upsert({
        ...item,
        user_id: userId,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,tmdb_id,item_type'
      });

    if (error) throw error;
  },

  // Migration
  async migrateGuestToUser(userId: string): Promise<void> {
    const guestData = await this.getGuestLastWatched();
    
    for (const item of guestData) {
      await this.saveUserLastWatched(userId, item);
    }
    
    localStorage.removeItem(STORAGE_KEY);
  },

  async clearGuestData(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
  }
};