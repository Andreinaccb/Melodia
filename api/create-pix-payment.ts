import { supabaseService } from '../lib/supabaseService.js';
import { mercadoPagoService } from '../lib/mercadoPagoService.js';

export default async function handler(req: any, res: any) {
  console.log('[API create-pix-payment] started');
  
  // Environment Diagnostics (Safe)
  console.log('[ENV] MERCADO_PAGO_ACCESS_TOKEN exists:', !!process.env.MERCADO_PAGO_ACCESS_TOKEN);
  console.log('[ENV] SUPABASE_URL exists:', !!process.env.SUPABASE_URL);

  const id = req.query.id || req.body?.id;

  if (!id) {
    return res.status(400).json({ error: 'ID do pedido é obrigatório.' });
  }

  try {
    const order = await supabaseService.getOrder(id);

    if (!order) {
      console.warn(`[API create-pix-payment] Order not found: ${id}`);
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    // Determine price (Music 19.90 + optional immediate delivery 9.90)
    const deliveryOption = req.body?.deliveryOption || 'standard';
    const amount = deliveryOption === 'immediate' ? 29.80 : 19.90;

    console.log(`[API create-pix-payment] Creating payment for order ${id}, amount ${amount}`);

    const paymentResponse = await mercadoPagoService.createPixPayment(
      amount,
      `Melodia IA - Música #${id.substring(4, 9)}`
    );

    const updatedOrder = await supabaseService.updateOrder(id, {
      mercado_pago_payment_id: paymentResponse.paymentId,
      payment_status: paymentResponse.status as any,
    });

    if (!updatedOrder) {
      console.error('[API create-pix-payment] DB update failed after payment creation');
      return res.status(500).json({ error: 'Erro ao atualizar pedido no banco.' });
    }

    return res.json({
      paymentId: paymentResponse.paymentId,
      qrCode: paymentResponse.qrCode,
      qrCodeBase64: paymentResponse.qrCodeBase64,
      status: paymentResponse.status,
    });
  } catch (error: any) {
    console.error('[API create-pix-payment] error:', error);
    return res.status(500).json({ 
      error: 'Erro ao gerar pagamento Pix.',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}
