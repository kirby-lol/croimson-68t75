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
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get guest last watched:', error);
      return [];
    }
  },

  async saveGuestLastWatched(item: Omit<LastWatched, 'id' | 'updated_at'>): Promise<void> {
    try {
      const existing = await this.getGuestLastWatched();
      const existingIndex = existing.findIndex(
        w => w.tmdb_id === item.tmdb_id && 
            w.item_type === item.item_type &&
            w.season === item.season &&
            w.episode === item.episode
      );

      const watchedItem: LastWatched = {
        ...item,
        id: uuidv4(),
        updated_at: new Date().toISOString()
      };

      if (existingIndex >= 0) {
        // Update existing item
        existing[existingIndex] = {
          ...existing[existingIndex],
          ...watchedItem,
          id: existing[existingIndex].id // Keep original ID
        };
      } else {
        // Add new item to the beginning
        existing.unshift(watchedItem);
      }

      // Keep only last 20 items
      const trimmed = existing.slice(0, 20);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch (error) {
      console.error('Failed to save guest last watched:', error);
    }
  },

  // User mode (Supabase)
  async getUserLastWatched(userId: string): Promise<LastWatched[]> {
    try {
      const { data, error } = await supabase
        .from('last_watched')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Supabase error getting last watched:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Failed to get user last watched:', error);
      return [];
    }
  },

  async saveUserLastWatched(userId: string, item: Omit<LastWatched, 'id' | 'updated_at'>): Promise<void> {
    try {
      const watchedItem = {
        ...item,
        user_id: userId,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('last_watched')
        .upsert(watchedItem, {
          onConflict: 'user_id,tmdb_id,item_type,season,episode'
        });

      if (error) {
        console.error('Supabase error saving last watched:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to save user last watched:', error);
      throw error;
    }
  },

  // Migration
  async migrateGuestToUser(userId: string): Promise<void> {
    try {
      const guestData = await this.getGuestLastWatched();
      
      for (const item of guestData) {
        const { id, updated_at, ...itemData } = item;
        await this.saveUserLastWatched(userId, itemData);
      }
      
      // Clear guest data after successful migration
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to migrate guest data:', error);
    }
  },

  async clearGuestData(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
  },

  async removeItem(userId: string | null, itemId: string): Promise<void> {
    try {
      if (userId) {
        // Remove from Supabase
        const { error } = await supabase
          .from('last_watched')
          .delete()
          .eq('id', itemId);

        if (error) {
          console.error('Failed to remove item from Supabase:', error);
        }
      } else {
        // Remove from localStorage
        const existing = await this.getGuestLastWatched();
        const filtered = existing.filter(item => item.id !== itemId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      }
    } catch (error) {
      console.error('Failed to remove last watched item:', error);
    }
  }
};