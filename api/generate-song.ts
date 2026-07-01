import { supabaseService } from '../lib/supabaseService.js';
import { musicGenerationService } from '../lib/musicGenerationService.js';
import { SongGenerationInput } from '../lib/types.js';

export default async function handler(req: any, res: any) {
  console.log('[API generate-song] started');
  
  // Environment Diagnostics
  console.log('[ENV] KIE_API_URL:', process.env.KIE_API_URL);
  console.log('[ENV] PUBLIC_APP_URL:', process.env.PUBLIC_APP_URL);
  console.log('[ENV] KIE_API_KEY exists:', !!process.env.KIE_API_KEY);
  console.log('[ENV] GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
  console.log('[ENV] SUPABASE_URL exists:', !!process.env.SUPABASE_URL);
  console.log('[ENV] SUPABASE_KEY exists:', !!process.env.SUPABASE_KEY);

  // Strict Variable Checks
  const requiredEnv = [
    'KIE_API_KEY', 
    'KIE_API_URL', 
    'GEMINI_API_KEY', 
    'SUPABASE_URL', 
    'SUPABASE_KEY', 
    'PUBLIC_APP_URL'
  ];
  
  for (const varName of requiredEnv) {
    if (!process.env[varName]) {
      console.error(`[API generate-song] Missing environment variable: ${varName}`);
      return res.status(500).json({ 
        error: "Missing environment variable", 
        missing: varName 
      });
    }
  }

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
      console.error('[API] Music generation failed:', err.message || err);
      return res.status(502).json({ 
        error: 'Falha ao iniciar a geração da música.',
        message: err.message || String(err)
      });
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
    console.error('[API generate-song] error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}
