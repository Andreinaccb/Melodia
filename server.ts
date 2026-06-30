import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import * as path from 'path';
import { createServer as createViteServer } from 'vite';
import { supabaseService } from './src/services/supabaseService';
import { trebloService } from './src/services/trebloService';
import { musicGenerationService } from './src/services/musicGenerationService';
import { mercadoPagoService } from './src/services/mercadoPagoService';
import { MusicOrder, SongGenerationInput } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON
  app.use(express.json());

  console.log(`[Server] Starting in ${process.env.NODE_ENV || 'development'} mode.`);

  // API Route: Generate a song
  app.post('/api/generate-song', async (req, res) => {
    try {
      const input = req.body as SongGenerationInput;
      
      // Basic validations
      if (!input.recipient || !input.musicStyle || !input.recipientName || !input.story || !input.emotion) {
        return res.status(400).json({ error: 'Todos os campos do formulário são obrigatórios.' });
      }

      console.log('[API] Song generation requested for recipient:', input.recipientName);

      // 1. Call Music Generation Service to start generation (tries Kie first, then Treblo)
      let generationResult;
      try {
        generationResult = await musicGenerationService.generateSong(input);
      } catch (err: any) {
        console.error('[API] Music generation failed:', err.message);
        return res.status(502).json({ error: err.message || 'Falha ao iniciar a geração da música. Tente novamente mais tarde.' });
      }

      // 2. Create order in Database (Supabase with JSON fallback)
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

      // Apply security rule: omit full_audio_url from response until approved
      const secureOrder = { ...order, full_audio_url: null };
      return res.status(201).json(secureOrder);
    } catch (error: any) {
      console.error('[API] Error in /api/generate-song:', error);
      return res.status(500).json({ error: 'Erro interno ao processar a geração da música.' });
    }
  });

  // API Route: Get order details (applying security mask on full_audio_url)
  app.get('/api/orders/:id', async (req, res) => {
    try {
      const orderId = req.params.id;
      const order = await supabaseService.getOrder(orderId);

      if (!order) {
        return res.status(404).json({ error: 'Pedido não encontrado.' });
      }

      // Secure order: Never leak full_audio_url unless status is approved
      const secureOrder = { ...order };
      if (secureOrder.payment_status !== 'approved') {
        secureOrder.full_audio_url = null;
      }

      return res.json(secureOrder);
    } catch (error: any) {
      console.error('[API] Error in GET /api/orders/:id:', error);
      return res.status(500).json({ error: 'Erro ao buscar pedido.' });
    }
  });

  // API Route: Check Generation Status
  app.get('/api/orders/:id/check-generation', async (req, res) => {
    try {
      const orderId = req.params.id;
      const order = await supabaseService.getOrder(orderId);

      if (!order) {
        return res.status(404).json({ error: 'Pedido não encontrado.' });
      }

      // 1. If we already have the preview URL (from callback), return SUCCESS / completed immediately
      if (order.preview_audio_url && order.generation_status === 'completed') {
        console.log(`[API] Order ${orderId} already completed via callback.`);
        const secureOrder = { ...order, full_audio_url: null };
        return res.json({ status: 'completed', previewAudioUrl: order.preview_audio_url, order: secureOrder });
      }

      // 2. If it failed via callback
      if (order.generation_status === 'failed') {
        console.warn(`[API] Order ${orderId} failed via callback. Error:`, order.generation_error);
        return res.json({ status: 'FAILED', message: order.generation_error || 'A geração da música falhou.' });
      }

      const provider = order.provider || 'treblo';
      const taskId = provider === 'kie' ? order.kie_task_id : order.treblo_generation_id;
      
      if (!taskId) {
        return res.status(400).json({ error: 'Nenhuma tarefa de geração associada a este pedido.' });
      }

      // Check for 10-minute timeout
      const createdAt = new Date(order.created_at);
      const now = new Date();
      const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
      
      if (diffMinutes > 10 && order.generation_status !== 'completed') {
        console.warn(`[API] Order ${orderId} timed out after 10 minutes.`);
        await supabaseService.updateOrder(orderId, {
          generation_status: 'failed',
          generation_error: 'A geração demorou mais que o esperado (limite de 10 minutos excedido).'
        });
        return res.json({ status: 'FAILED', message: 'Tempo limite excedido.' });
      }

      // 3. Fallback: Polling if callback hasn't arrived yet
      const { status } = await musicGenerationService.checkStatus(provider, taskId);
      console.log(`[API] Order ${orderId} (${provider}) polling status:`, status);

      if (status === 'SUCCESS') {
        try {
          const result = await musicGenerationService.getResult(provider, taskId);
          
          if (provider === 'kie') {
            console.log('[KIE POLLING] SUCCESS detectado');
          }

          // Rule 6: Omit columns like duration and title that may not exist in the database table
          const updatedOrder = await supabaseService.updateOrder(orderId, {
            preview_audio_url: result.previewAudioUrl,
            full_audio_url: result.fullAudioUrl,
            image_url: result.imageUrl,
            generation_status: 'completed'
          });

          if (provider === 'kie') {
            console.log('[KIE POLLING] Supabase atualizado');
          }

          if (!updatedOrder) {
            return res.status(500).json({ error: 'Erro ao atualizar pedido.' });
          }

          const secureOrder = { ...updatedOrder, full_audio_url: null };
          return res.json({ status: 'completed', previewAudioUrl: result.previewAudioUrl, order: secureOrder });
        } catch (err: any) {
          console.error(`[API] Error retrieving result from ${provider}:`, err);
          return res.status(502).json({ error: 'Erro ao obter as URLs de áudio.' });
        }
      } else if (status === 'FAILED') {
        await supabaseService.updateOrder(orderId, { generation_status: 'failed' });
        return res.json({ status: 'FAILED', message: 'A geração da música falhou no servidor.' });
      } else {
        return res.json({ status: 'PROCESSING', message: 'Criando sua música... Isso pode levar alguns instantes.' });
      }
    } catch (error: any) {
      console.error('[API] Error checking generation:', error);
      return res.status(500).json({ error: 'Erro ao verificar o status de geração da música.' });
    }
  });

  // API Route: Create Pix payment
  app.post('/api/orders/:id/create-pix', async (req, res) => {
    try {
      const orderId = req.params.id;
      const order = await supabaseService.getOrder(orderId);

      if (!order) {
        return res.status(404).json({ error: 'Pedido não encontrado.' });
      }

      console.log('[API] Creating Pix payment on Mercado Pago for order:', orderId);

      // Create payment via Mercado Pago
      const paymentResponse = await mercadoPagoService.createPixPayment(
        19.90,
        `Melodia IA - Música Personalizada #${orderId.substring(4, 9)}`
      );

      // Update order in database with payment ID and status
      const updatedOrder = await supabaseService.updateOrder(orderId, {
        mercado_pago_payment_id: paymentResponse.paymentId,
        payment_status: paymentResponse.status as any,
      });

      if (!updatedOrder) {
        return res.status(500).json({ error: 'Erro ao salvar informações de pagamento no banco de dados.' });
      }

      return res.json({
        paymentId: paymentResponse.paymentId,
        qrCode: paymentResponse.qrCode,
        qrCodeBase64: paymentResponse.qrCodeBase64,
        status: paymentResponse.status,
      });
    } catch (error: any) {
      console.error('[API] Error creating Pix payment:', error);
      return res.status(500).json({ error: 'Erro ao gerar pagamento Pix via Mercado Pago.' });
    }
  });

  // API Route: Check Pix payment status
  app.get('/api/orders/:id/check-payment', async (req, res) => {
    try {
      const orderId = req.params.id;
      const order = await supabaseService.getOrder(orderId);

      if (!order) {
        return res.status(404).json({ error: 'Pedido não encontrado.' });
      }

      const paymentId = order.mercado_pago_payment_id;
      if (!paymentId) {
        return res.status(400).json({ error: 'Nenhum pagamento foi iniciado para este pedido.' });
      }

      // Check status with Mercado Pago
      const { status } = await mercadoPagoService.checkPaymentStatus(paymentId);
      console.log(`[API] Payment status for order ${orderId} (${paymentId}):`, status);

      let updatedOrder = order;
      if (status !== order.payment_status) {
        const orderUpdate = await supabaseService.updateOrder(orderId, {
          payment_status: status as any,
        });
        if (orderUpdate) {
          updatedOrder = orderUpdate;
        }
      }

      // Apply the core safety rule: Only send full_audio_url if status is 'approved'
      const secureOrder = { ...updatedOrder };
      if (secureOrder.payment_status !== 'approved') {
        secureOrder.full_audio_url = null;
      }

      return res.json({
        status: status,
        order: secureOrder,
      });
    } catch (error: any) {
      console.error('[API] Error in checking payment status:', error);
      return res.status(500).json({ error: 'Erro ao verificar o status do pagamento.' });
    }
  });

  // API Route: Force approve simulated payment (For Demo testing ease)
  app.post('/api/orders/:id/force-approve', async (req, res) => {
    try {
      const orderId = req.params.id;
      const order = await supabaseService.getOrder(orderId);

      if (!order) {
        return res.status(404).json({ error: 'Pedido não encontrado.' });
      }

      const paymentId = order.mercado_pago_payment_id;
      if (!paymentId) {
        return res.status(400).json({ error: 'Nenhum pagamento associado.' });
      }

      const success = mercadoPagoService.forceApproveSimulatedPayment(paymentId);
      if (success) {
        const updatedOrder = await supabaseService.updateOrder(orderId, {
          payment_status: 'approved',
        });
        return res.json({ success: true, order: updatedOrder });
      } else {
        // If real Mercado Pago was configured, we can't force approve
        return res.status(400).json({ error: 'Não é possível forçar aprovação em pagamentos reais do Mercado Pago.' });
      }
    } catch (error: any) {
      console.error('[API] Error in force-approve:', error);
      return res.status(500).json({ error: 'Erro ao simular aprovação do pagamento.' });
    }
  });

  // API Route: Kie Callback Webhook
  app.post('/api/kie-callback', async (req, res) => {
    try {
      const body = req.body;
      console.log('[KIE CALLBACK] Body recebido:', JSON.stringify(body, null, 2));

      if (!body) return res.status(400).json({ error: 'Body vazio' });

      // 2. Extrair Task ID
      const taskId = body?.data?.task_id || body?.data?.taskId || body?.task_id || body?.taskId;
      console.log('[KIE CALLBACK] taskId extraído:', taskId);

      if (!taskId) {
        console.warn('[KIE CALLBACK] Task ID não encontrado no payload.');
        return res.status(400).json({ error: 'Task ID não encontrado' });
      }

      // 3. Buscar o pedido correspondente
      const order = await supabaseService.getOrderByKieTaskId(taskId);
      if (!order) {
        console.warn('[KIE CALLBACK] Pedido não encontrado para o task_id:', taskId);
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }

      const updates: any = {};
      const code = body.code;
      const kieData = body.data || {};
      const callbackType = kieData.callbackType || body.callbackType;

      // 4. Lógica de Sucesso (callbackType === 'complete' e code === 200)
      if (code === 200 && callbackType === 'complete') {
        let musicData = null;
        if (body?.data?.data && Array.isArray(body.data.data) && body.data.data.length > 0) {
          musicData = body.data.data[0];
        } else if (body?.data?.response?.sunoData && Array.isArray(body.data.response.sunoData) && body.data.response.sunoData.length > 0) {
          musicData = body.data.response.sunoData[0];
        }

        if (musicData) {
          console.log('[KIE CALLBACK] Música encontrada:', JSON.stringify(musicData, null, 2));

          const streamAudioUrl = musicData.streamAudioUrl || musicData.stream_audio_url;
          const audioUrl = musicData.audioUrl || musicData.audio_url;
          const imageUrl = musicData.imageUrl || musicData.image_url;

          updates.generation_status = 'completed';
          updates.preview_audio_url = streamAudioUrl || audioUrl || musicData.stream_audio_url || musicData.audio_url;
          updates.full_audio_url = audioUrl || streamAudioUrl || musicData.audio_url || musicData.stream_audio_url;
          updates.image_url = imageUrl || musicData.image_url;
        }
      } 
      // 5. Lógica de Erro (code 501 ou callbackType === 'error')
      else if (code === 501 || callbackType === 'error') {
        updates.generation_status = 'failed';
        updates.generation_error = body.msg || kieData.msg || 'Erro desconhecido na Kie';
        console.error('[KIE CALLBACK] Falha na geração:', updates.generation_error);
      } else {
        updates.generation_status = 'processing';
      }

      await supabaseService.updateOrder(order.id, updates);
      console.log('[KIE CALLBACK] Supabase atualizado:', order.id);

      return res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('[KIE CALLBACK] Erro crítico:', error);
      return res.status(500).json({ error: 'Internal error' });
    }
  });

  // Serve static UI / assets
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Web application running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('[Server] Critical start failure:', error);
});
