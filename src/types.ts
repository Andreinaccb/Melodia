export type RecipientType =
  | 'Namorado(a)'
  | 'Esposo(a)'
  | 'Filho(a)'
  | 'Mãe/Pai'
  | 'Amigo(a)'
  | 'Outro';

export type MusicStyleType =
  | 'Sertanejo'
  | 'Pop'
  | 'Gospel'
  | 'Pagode'
  | 'MPB'
  | 'Trap'
  | 'Funk Melody'
  | 'Acústico'
  | 'Outro';

export type OccasionType = string;

export type EmotionType =
  | 'Amor'
  | 'Saudade'
  | 'Gratidão'
  | 'Superação'
  | 'Alegria'
  | 'Fé'
  | 'Romance';

export interface MusicOrder {
  id: string;
  recipient: RecipientType;
  music_style: MusicStyleType;
  recipient_name: string;
  sender_name?: string;
  story: string;
  occasion?: OccasionType;
  emotion: EmotionType;
  vocal_gender: 'm' | 'f';
  provider: 'kie' | 'treblo';
  kie_task_id?: string | null;
  treblo_generation_id: string | null;
  preview_audio_url: string | null;
  full_audio_url: string | null;
  generation_status?: 'pending' | 'processing' | 'completed' | 'failed';
  generation_error?: string | null;
  image_url?: string | null;
  alternative_audio_url?: string | null;
  title?: string | null;
  duration?: number | null;
  mercado_pago_payment_id: string | null;
  payment_status: 'pending' | 'approved' | 'rejected' | 'in_process';
  created_at: string;
  updated_at: string;
}

export interface SongGenerationInput {
  recipient: RecipientType;
  musicStyle: MusicStyleType;
  recipientName: string;
  senderName?: string;
  story: string;
  occasion?: OccasionType;
  emotion: EmotionType;
  vocalGender: 'm' | 'f';
}

export type Step = 'form' | 'generating' | 'preview' | 'checkout' | 'success';
