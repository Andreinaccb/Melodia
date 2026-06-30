import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { MusicOrder } from '../types';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

let supabaseClient: any = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseKey);
    console.log('[Supabase] Client initialized successfully.');
  } catch (error) {
    console.error('[Supabase] Failed to initialize Supabase client:', error);
  }
} else {
  console.log('[Supabase] No credentials found. Using local JSON file fallback for orders database.');
}

// Local JSON File Fallback configuration
const LOCAL_DB_PATH = path.join(process.cwd(), 'music_orders_db.json');

function readLocalOrders(): MusicOrder[] {
  try {
    if (!fs.existsSync(LOCAL_DB_PATH)) {
      fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
    return JSON.parse(data) as MusicOrder[];
  } catch (error) {
    console.error('[LocalDB] Error reading local db file:', error);
    return [];
  }
}

function writeLocalOrders(orders: MusicOrder[]) {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(orders, null, 2));
  } catch (error) {
    console.error('[LocalDB] Error writing local db file:', error);
  }
}

export const supabaseService = {
  async createOrder(orderData: Omit<MusicOrder, 'id' | 'created_at' | 'updated_at' | 'payment_status'>): Promise<MusicOrder> {
    const id = 'ord_' + Math.random().toString(36).substring(2, 15);
    const now = new Date().toISOString();
    
    const newOrder: MusicOrder = {
      ...orderData,
      id,
      payment_status: 'pending',
      created_at: now,
      updated_at: now,
    };

    if (supabaseClient) {
      try {
        console.log('[Supabase] Creating music_order:', id);
        
        const insertObj: any = {
          id: newOrder.id,
          recipient: newOrder.recipient,
          music_style: newOrder.music_style,
          recipient_name: newOrder.recipient_name,
          sender_name: newOrder.sender_name,
          story: newOrder.story,
          occasion: newOrder.occasion,
          emotion: newOrder.emotion,
          treblo_generation_id: newOrder.treblo_generation_id,
          preview_audio_url: newOrder.preview_audio_url,
          full_audio_url: newOrder.full_audio_url,
          mercado_pago_payment_id: newOrder.mercado_pago_payment_id,
          payment_status: newOrder.payment_status,
          created_at: newOrder.created_at,
          updated_at: newOrder.updated_at,
          vocal_gender: newOrder.vocal_gender,
          provider: newOrder.provider,
          kie_task_id: newOrder.kie_task_id,
          generation_status: newOrder.generation_status,
          generation_error: newOrder.generation_error,
          image_url: newOrder.image_url,
          alternative_audio_url: newOrder.alternative_audio_url,
        };

        let { data, error } = await supabaseClient
          .from('music_orders')
          .insert([insertObj])
          .select();

        if (error) {
          console.warn('[Supabase] Insert failed, trying standard insert without new columns:', error.message);
          
          // Retry inserting without new columns
          const fallbackInsertObj = { ...insertObj };
          const columnsToRemove = [
            'vocal_gender', 
            'provider', 
            'kie_task_id', 
            'generation_status', 
            'generation_error', 
            'image_url', 
            'alternative_audio_url',
            'title',
            'duration'
          ];
          
          columnsToRemove.forEach(col => delete fallbackInsertObj[col]);
          
          const retryResult = await supabaseClient
            .from('music_orders')
            .insert([fallbackInsertObj])
            .select();
            
          if (retryResult.error) {
            console.error('[Supabase] Retry also failed, falling back to local storage:', retryResult.error.message);
          } else if (retryResult.data && retryResult.data.length > 0) {
            return {
              ...retryResult.data[0],
              // Preserve the new properties for runtime usage
              vocal_gender: newOrder.vocal_gender,
              provider: newOrder.provider,
              kie_task_id: newOrder.kie_task_id,
            } as MusicOrder;
          }
        } else if (data && data.length > 0) {
          return data[0] as MusicOrder;
        }
      } catch (err) {
        console.error('[Supabase] Exception occurred on insert, falling back to local:', err);
      }
    }

    // Local DB Fallback
    const orders = readLocalOrders();
    orders.push(newOrder);
    writeLocalOrders(orders);
    return newOrder;
  },

  async getOrder(id: string): Promise<MusicOrder | null> {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('music_orders')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.warn('[Supabase] Error fetching order from Supabase:', error.message, 'Checking local...');
        } else if (data) {
          return data as MusicOrder;
        }
      } catch (err) {
        console.error('[Supabase] Exception on getOrder:', err);
      }
    }

    // Check local fallback
    const orders = readLocalOrders();
    const order = orders.find((o) => o.id === id);
    return order || null;
  },

  async updateOrder(id: string, updates: Partial<MusicOrder>): Promise<MusicOrder | null> {
    const now = new Date().toISOString();
    const updatedFields = { ...updates, updated_at: now };

    if (supabaseClient) {
      try {
        console.log('[Supabase] Updating order', id, updatedFields);
        const { data, error } = await supabaseClient
          .from('music_orders')
          .update(updatedFields)
          .eq('id', id)
          .select();

        if (error) {
          console.error('[Supabase] Update failed on Supabase:', error.message, 'Trying update without new columns...');
          
          const fallbackUpdates = { ...updatedFields };
          const columnsToRemove = [
            'vocal_gender', 
            'provider', 
            'kie_task_id', 
            'generation_status', 
            'generation_error', 
            'image_url', 
            'alternative_audio_url',
            'title',
            'duration'
          ];
          
          columnsToRemove.forEach(col => delete (fallbackUpdates as any)[col]);

          const retryResult = await supabaseClient
            .from('music_orders')
            .update(fallbackUpdates)
            .eq('id', id)
            .select();

          if (retryResult.error) {
            console.error('[Supabase] Retry update also failed:', retryResult.error.message);
          } else if (retryResult.data && retryResult.data.length > 0) {
            return retryResult.data[0] as MusicOrder;
          }
        } else if (data && data.length > 0) {
          return data[0] as MusicOrder;
        }
      } catch (err) {
        console.error('[Supabase] Exception on updateOrder:', err);
      }
    }

    // Local DB Fallback
    const orders = readLocalOrders();
    const index = orders.findIndex((o) => o.id === id);
    if (index !== -1) {
      orders[index] = { ...orders[index], ...updatedFields };
      writeLocalOrders(orders);
      return orders[index];
    }

    return null;
  },

  async getOrderByKieTaskId(kieTaskId: string): Promise<MusicOrder | null> {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('music_orders')
          .select('*')
          .eq('kie_task_id', kieTaskId)
          .maybeSingle();

        if (error) {
          console.warn('[Supabase] Error fetching order by kie_task_id:', error.message);
        } else if (data) {
          return data as MusicOrder;
        }
      } catch (err) {
        console.error('[Supabase] Exception on getOrderByKieTaskId:', err);
      }
    }

    // Check local fallback
    const orders = readLocalOrders();
    const order = orders.find((o) => o.kie_task_id === kieTaskId);
    return order || null;
  },
};
