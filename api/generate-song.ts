import { supabaseService } from '../src/services/supabaseService';
import { musicGenerationService } from '../src/services/musicGenerationService';
import { SongGenerationInput } from '../src/types';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const input = req.body as SongGenerationInput;
    
    // Basic validations
    if (!input.recipient || !input.musicStyle || !input.recipientName || !input.story || !input.emotion) {
      return res.status(400).json({ error: 'Todos os campos do formulário são obrigatórios.' });
    }

    console.log('[API] Song generation requested for recipient:', input.recipientName);

    // 1. Call Music Generation Service
    let generationResult;
    try {
      generationResult = await musicGenerationService.generateSong(input);
    } catch (err: any) {
      console.error('[API] Music generation failed:', err.message);
      return res.status(502).json({ error: err.message || 'Falha ao iniciar a geração da música.' });
    }

    // 2. Create order in Database
    const order = await supabaseService.createOrder({
      recipient: input.recipient,
      music_style: input.musicStyle,
      recipient_name: input.recipientName,
      sender_name: input.senderName || 'Alguém que te ama',
      story: input.story,
      occasion: input.occasion || '',
      emotion: input.emotion,
      vocal_gender: input.vocalGender,
      provider: generationResult.provider,
      kie_task_id: generationResult.provider === 'kie' ? generationResult.taskId : null,
      treblo_generation_id: generationResult.provider === 'treblo' ? generationResult.taskId : null,
      preview_audio_url: null,
      full_audio_url: null,
      generation_status: 'processing',
      mercado_pago_payment_id: null,
    });

    console.log('[API] Order created successfully:', order.id);

    // Secure order: omit full_audio_url from response
    const secureOrder = { ...order, full_audio_url: null };
    return res.status(201).json(secureOrder);
  } catch (error: any) {
    console.error('[API] Error in generate-song:', error);
    return res.status(500).json({ error: 'Erro interno ao processar a geração.' });
  }
}
