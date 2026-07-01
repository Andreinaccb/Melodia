import { supabaseService } from '../src/services/supabaseService';
import { musicGenerationService } from '../src/services/musicGenerationService';

export default async function handler(req: any, res: any) {
  console.log('[API check-song-status] started');

  // Support both GET and POST for flexibility
  const id = req.query.id || req.body?.id;

  if (!id) {
    return res.status(400).json({ error: 'ID do pedido é obrigatório.' });
  }

  try {
    const order = await supabaseService.getOrder(id);

    if (!order) {
      console.warn(`[API check-song-status] Order not found: ${id}`);
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    // 1. Check if already completed via callback
    if (order.preview_audio_url && order.generation_status === 'completed') {
      const secureOrder = { ...order, full_audio_url: null };
      return res.json({ status: 'completed', previewAudioUrl: order.preview_audio_url, order: secureOrder });
    }

    // 2. Check if failed
    if (order.generation_status === 'failed') {
      return res.json({ status: 'FAILED', message: order.generation_error || 'A geração falhou.' });
    }

    const provider = order.provider || 'treblo';
    const taskId = provider === 'kie' ? order.kie_task_id : order.treblo_generation_id;
    
    if (!taskId) {
      console.warn(`[API check-song-status] No taskId for order: ${id}`);
      return res.status(400).json({ error: 'Nenhuma tarefa associada.' });
    }

    // 3. Fallback polling
    console.log(`[API check-song-status] Polling provider ${provider} for task ${taskId}`);
    const { status } = await musicGenerationService.checkStatus(provider as any, taskId);
    
    if (status === 'SUCCESS') {
      try {
        const result = await musicGenerationService.getResult(provider as any, taskId);
        
        const updatedOrder = await supabaseService.updateOrder(id, {
          preview_audio_url: result.previewAudioUrl,
          full_audio_url: result.fullAudioUrl,
          image_url: result.imageUrl,
          generation_status: 'completed'
        });

        if (!updatedOrder) {
          return res.status(500).json({ error: 'Erro ao atualizar pedido.' });
        }

        const secureOrder = { ...updatedOrder, full_audio_url: null };
        return res.json({ status: 'completed', previewAudioUrl: result.previewAudioUrl, order: secureOrder });
      } catch (err: any) {
        console.error('[API check-song-status] Result retrieval failed:', err);
        return res.status(502).json({ 
          error: 'Erro ao obter resultados.',
          message: err.message || String(err)
        });
      }
    } else if (status === 'FAILED') {
      await supabaseService.updateOrder(id, { generation_status: 'failed' });
      return res.json({ status: 'FAILED', message: 'A geração falhou no servidor.' });
    } else {
      return res.json({ status: 'PROCESSING', message: 'Criando sua música...' });
    }
  } catch (error: any) {
    console.error('[API check-song-status] error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}
