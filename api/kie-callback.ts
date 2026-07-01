import { supabaseService } from '../lib/supabaseService.js';

export default async function handler(req: any, res: any) {
  console.log('[KIE CALLBACK] started');
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;
    console.log('[KIE CALLBACK] Payload:', JSON.stringify(body));

    if (!body) return res.status(400).json({ error: 'Body vazio' });

    const taskId = body?.data?.task_id || body?.data?.taskId || body?.task_id || body?.taskId;
    
    if (!taskId) {
      console.warn('[KIE CALLBACK] No taskId in payload');
      return res.status(400).json({ error: 'Task ID não encontrado' });
    }

    const order = await supabaseService.getOrderByKieTaskId(taskId);
    if (!order) {
      console.warn(`[KIE CALLBACK] Order not found for taskId: ${taskId}`);
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    const updates: any = {};
    const code = body.code;
    const kieData = body.data || {};
    const callbackType = kieData.callbackType || body.callbackType;

    if (code === 200 && callbackType === 'complete') {
      console.log(`[KIE CALLBACK] Success for taskId ${taskId}`);
      let musicData = null;
      if (body?.data?.data && Array.isArray(body.data.data) && body.data.data.length > 0) {
        musicData = body.data.data[0];
      } else if (body?.data?.response?.sunoData && Array.isArray(body.data.response.sunoData) && body.data.response.sunoData.length > 0) {
        musicData = body.data.response.sunoData[0];
      }

      if (musicData) {
        const streamAudioUrl = musicData.streamAudioUrl || musicData.stream_audio_url;
        const audioUrl = musicData.audioUrl || musicData.audio_url;
        const imageUrl = musicData.imageUrl || musicData.image_url;

        updates.generation_status = 'completed';
        updates.preview_audio_url = streamAudioUrl || audioUrl;
        updates.full_audio_url = audioUrl || streamAudioUrl;
        updates.image_url = imageUrl;
      }
    } 
    else if (code === 501 || callbackType === 'error') {
      console.error(`[KIE CALLBACK] Error for taskId ${taskId}:`, body.msg || kieData.msg);
      updates.generation_status = 'failed';
      updates.generation_error = body.msg || kieData.msg || 'Erro na Kie';
    } else {
      console.log(`[KIE CALLBACK] Update for taskId ${taskId}: ${callbackType}`);
      updates.generation_status = 'processing';
    }

    await supabaseService.updateOrder(order.id, updates);
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('[KIE CALLBACK] Erro:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}
