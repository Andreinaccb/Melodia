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

    // Determine price (Music 19.90 + optional immediate delivery 9.90)
    // For simplicity, we can pass the delivery option in the body
    const deliveryOption = req.body?.deliveryOption || 'standard';
    const amount = deliveryOption === 'immediate' ? 29.80 : 19.90;

    const paymentResponse = await mercadoPagoService.createPixPayment(
      amount,
      `Melodia IA - Música #${id.substring(4, 9)}`
    );

    const updatedOrder = await supabaseService.updateOrder(id, {
      mercado_pago_payment_id: paymentResponse.paymentId,
      payment_status: paymentResponse.status as any,
    });

    if (!updatedOrder) {
      return res.status(500).json({ error: 'Erro ao atualizar pedido no banco.' });
    }

    return res.json({
      paymentId: paymentResponse.paymentId,
      qrCode: paymentResponse.qrCode,
      qrCodeBase64: paymentResponse.qrCodeBase64,
      status: paymentResponse.status,
    });
  } catch (error: any) {
    console.error('[API] Error creating Pix:', error);
    return res.status(500).json({ error: 'Erro ao gerar pagamento Pix.' });
  }
}
