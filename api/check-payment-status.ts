import { supabaseService } from '../lib/supabaseService.js';
import { mercadoPagoService } from '../lib/mercadoPagoService.js';

export default async function handler(req: any, res: any) {
  console.log('[API check-payment-status] started');

  const id = req.query.id || req.body?.id;

  if (!id) {
    return res.status(400).json({ error: 'ID do pedido é obrigatório.' });
  }

  try {
    const order = await supabaseService.getOrder(id);

    if (!order) {
      console.warn(`[API check-payment-status] Order not found: ${id}`);
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    const paymentId = order.mercado_pago_payment_id;
    if (!paymentId) {
      console.warn(`[API check-payment-status] No paymentId for order: ${id}`);
      return res.status(400).json({ error: 'Nenhum pagamento iniciado.' });
    }

    console.log(`[API check-payment-status] Checking status for payment ${paymentId}`);
    const { status } = await mercadoPagoService.checkPaymentStatus(paymentId);

    let updatedOrder = order;
    if (status !== order.payment_status) {
      console.log(`[API check-payment-status] Status changed from ${order.payment_status} to ${status}`);
      const orderUpdate = await supabaseService.updateOrder(id, {
        payment_status: status as any,
      });
      if (orderUpdate) {
        updatedOrder = orderUpdate;
      }
    }

    const secureOrder = { ...updatedOrder };
    if (secureOrder.payment_status !== 'approved') {
      secureOrder.full_audio_url = null;
    }

    return res.json({
      status: status,
      order: secureOrder,
    });
  } catch (error: any) {
    console.error('[API check-payment-status] error:', error);
    return res.status(500).json({ 
      error: 'Erro ao verificar pagamento.',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}
