const MERCADO_PAGO_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN || '';
const MERCADO_PAGO_PUBLIC_KEY = process.env.MERCADO_PAGO_PUBLIC_KEY || '';

export interface PixPaymentResponse {
  paymentId: string;
  qrCode: string;
  qrCodeBase64: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_process';
}

// Memory cache for simulated payments status to keep state between polls
const simulatedPayments: Record<string, { status: string; createdAt: number }> = {};

export const mercadoPagoService = {
  isConfigured(): boolean {
    return (
      MERCADO_PAGO_ACCESS_TOKEN !== '' &&
      MERCADO_PAGO_ACCESS_TOKEN !== 'your_mercado_pago_access_token' &&
      MERCADO_PAGO_ACCESS_TOKEN !== 'MY_MERCADO_PAGO_ACCESS_TOKEN'
    );
  },

  async createPixPayment(amount: number, description: string): Promise<PixPaymentResponse> {
    console.log('[MercadoPago] Creating Pix payment for amount:', amount);

    if (!this.isConfigured()) {
      console.warn('[MercadoPago] Access token not configured. Creating simulated Pix payment.');
      const simulatedId = 'pay_' + Math.random().toString(36).substring(2, 12);
      
      // Store in memory cache
      simulatedPayments[simulatedId] = {
        status: 'pending',
        createdAt: Date.now(),
      };

      // Generate a realistic mock Pix copy & paste code
      const mockPixCode = '00020101021226830014br.gov.bcb.pix2561pix.mercadopago.com/qr/v2/52a8a5e5-f8be-4395-81fa-234b3e817a02520400005303986540519.905802BR5910Melodia_IA6009Sao_Paulo62070503***6304D1A8';
      // A mock QR code image in base64 (a small placeholder qr-code image)
      const mockQrCodeBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAJQAAACUAQMAAABf0l8ZAAAABlBMVEUAAAD///+l2Z/dAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVRIie3IsQ0AAACDoPT/6ArbEAgm3b2RSIuXl5eXl5eXl5eXl5eXl5eXl5fXDRqMAmX9OshZAAAAAElFTkSuQmCC';

      return {
        paymentId: simulatedId,
        qrCode: mockPixCode,
        qrCodeBase64: mockQrCodeBase64,
        status: 'pending',
      };
    }

    try {
      const idempotencyKey = 'idemp_' + Math.random().toString(36).substring(2, 15);
      const response = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
          'X-Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          transaction_amount: amount,
          description: description,
          payment_method_id: 'pix',
          payer: {
            email: 'compras@melodiaia.com.br',
            first_name: 'Cliente',
            last_name: 'Melodia IA',
          },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[MercadoPago] API error: Status ${response.status}`, errText);
        throw new Error(`Erro no Mercado Pago: ${response.status} - ${errText}`);
      }

      const data = await response.json();
      console.log('[MercadoPago] Payment created response:', {
        id: data.id,
        status: data.status,
      });

      const qrCode = data.point_of_interaction?.transaction_data?.qr_code || '';
      const qrCodeBase64 = data.point_of_interaction?.transaction_data?.qr_code_base64 || '';

      return {
        paymentId: String(data.id),
        qrCode,
        qrCodeBase64,
        status: data.status as any,
      };
    } catch (error: any) {
      console.error('[MercadoPago] Exception in createPixPayment:', error);
      throw error;
    }
  },

  async checkPaymentStatus(paymentId: string): Promise<{ status: 'pending' | 'approved' | 'rejected' | 'in_process' }> {
    console.log('[MercadoPago] Checking payment status for:', paymentId);

    // If it is a simulated payment
    if (paymentId.startsWith('pay_')) {
      const payment = simulatedPayments[paymentId];
      if (!payment) {
        return { status: 'pending' };
      }

      // Automatically approve after 20 seconds for realistic sandbox simulation flow
      const elapsed = Date.now() - payment.createdAt;
      if (elapsed > 20000 && payment.status === 'pending') {
        payment.status = 'approved';
        console.log('[MercadoPago] [Simulated] Auto-approving simulated payment:', paymentId);
      }

      return { status: payment.status as any };
    }

    if (!this.isConfigured()) {
      return { status: 'pending' };
    }

    try {
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
        },
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[MercadoPago] Error fetching payment status: Status ${response.status}`, errText);
        throw new Error(`Erro ao checar pagamento: ${response.status}`);
      }

      const data = await response.json();
      console.log('[MercadoPago] Check status result:', {
        id: data.id,
        status: data.status,
      });

      return { status: data.status as any };
    } catch (error: any) {
      console.error('[MercadoPago] Exception in checkPaymentStatus:', error);
      throw error;
    }
  },

  // Helper method for manually approving simulated payment in UI (for testing convenience)
  forceApproveSimulatedPayment(paymentId: string): boolean {
    if (paymentId.startsWith('pay_') && simulatedPayments[paymentId]) {
      simulatedPayments[paymentId].status = 'approved';
      console.log('[MercadoPago] [Simulated] Manually forced approval for payment:', paymentId);
      return true;
    }
    return false;
  },
};
