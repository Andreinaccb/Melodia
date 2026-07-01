import { supabaseService } from '../src/services/supabaseService';
import { mercadoPagoService } from '../src/services/mercadoPagoService';

export default async function handler(req: any, res: any) {
  const id = req.query.id || req.body?.id;

  if (!id) {
    return res.status(400).json({ error: 'ID do pedido é obrigatório.' });
  }

  try {
    const order = await supabaseService.getOrder(id);

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    const paymentId = order.mercado_pago_payment_id;
    if (!paymentId) {
      return res.status(400).json({ error: 'Nenhum pagamento iniciado.' });
    }

    const { status } = await mercadoPagoService.checkPaymentStatus(paymentId);

    let updatedOrder = order;
    if (status !== order.payment_status) {
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
    console.error('[API] Error checking payment:', error);
    return res.status(500).json({ error: 'Erro ao verificar pagamento.' });
  }
}
