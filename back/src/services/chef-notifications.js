import pkg from 'whatsapp-web.js';
const { Client } = pkg;

// Servicio para enviar notificaciones al cocinero
class ChefNotificationService {
  constructor(whatsappClient) {
    this.whatsappClient = whatsappClient;
    this.chefPhone = process.env.CHEF_PHONE;
  }

  async sendOrderToChef(orderId, orderInfo) {
    try {
      if (!this.chefPhone) {
        console.log('⚠️ Número del cocinero no configurado');
        return;
      }

      const message = this.formatOrderForChef(orderId, orderInfo);
      
      // Enviar mensaje al cocinero
      const chatId = this.chefPhone.replace('+', '') + '@c.us';
      await this.whatsappClient.sendMessage(chatId, message);
      
      console.log(`📨 Comanda enviada al cocinero para pedido #${orderId}`);
    } catch (error) {
      console.error('Error enviando comanda al cocinero:', error);
    }
  }

  formatOrderForChef(orderId, orderInfo) {
    const items = orderInfo.items.map(item => 
      `🍽️ ${item.quantity}x ${item.name}`
    ).join('\n');

    const serviceIcon = orderInfo.service_type === 'delivery' ? '🚚' : '📦';
    const serviceText = orderInfo.service_type === 'delivery' ? 'Delivery' : 'Take Away';

    return `
🔔 *NUEVO PEDIDO #${orderId}*

👤 *Cliente:* ${orderInfo.customer_name}
📞 *Teléfono:* ${orderInfo.customer_phone || 'No proporcionado'}

${items}

${serviceIcon} *Servicio:* ${serviceText}
${orderInfo.delivery_address ? `📍 *Dirección:* ${orderInfo.delivery_address}` : ''}
💰 *Pago:* ${orderInfo.payment_method}
${orderInfo.scheduled_date && orderInfo.scheduled_date !== new Date().toISOString().split('T')[0] 
  ? `📅 *Para:* ${orderInfo.scheduled_date}` 
  : '📅 *Para:* HOY'}

*Responde:*
✅ *TODO OK* - Si tienes todos los ingredientes
❌ *SIN: [producto]* - Si falta algún producto
⏱️ *DEMORA: [minutos]* - Si hay demora adicional
    `.trim();
  }

  async sendStatusUpdate(orderId, status, customerPhone) {
    try {
      let message = '';
      
      switch (status) {
        case 'confirmed':
          message = `✅ Tu pedido #${orderId} ha sido confirmado y está en preparación. Tiempo estimado: 30-45 minutos.`;
          break;
        case 'ready':
          message = `🎉 ¡Tu pedido #${orderId} está listo! ${orderInfo.service_type === 'delivery' ? 'Saldrá para delivery en breve.' : 'Puedes pasar a retirarlo.'}`;
          break;
        case 'delivered':
          message = `✅ Pedido #${orderId} entregado. ¡Gracias por elegir Plaza Nadal! 🇪🇸`;
          break;
      }

      if (message) {
        const chatId = customerPhone + '@c.us';
        await this.whatsappClient.sendMessage(chatId, message);
      }
    } catch (error) {
      console.error('Error enviando actualización al cliente:', error);
    }
  }

  async sendDailyOrdersSummary() {
    try {
      if (!this.chefPhone) return;

      const { getTodayOrders } = await import('./database-service.js');
      const orders = await getTodayOrders();

      if (orders.length === 0) {
        return;
      }

      let message = `📅 *PEDIDOS DEL DÍA*\n\n`;
      
      orders.forEach(order => {
        const items = order.items.map(item => 
          `• ${item.quantity}x ${item.product_name}`
        ).join('\n');

        message += `🔸 *Pedido #${order.id}*\n`;
        message += `👤 ${order.customer_name}\n`;
        message += `${items}\n`;
        message += `📦 ${order.service_type === 'delivery' ? 'Delivery' : 'Take Away'}\n`;
        message += `⏰ ${order.scheduled_time || 'Sin hora específica'}\n`;
        message += `📊 Estado: ${this.getStatusEmoji(order.status)} ${order.status}\n\n`;
      });

      const chatId = this.chefPhone.replace('+', '') + '@c.us';
      await this.whatsappClient.sendMessage(chatId, message);
      
      console.log('📊 Resumen diario enviado al cocinero');
    } catch (error) {
      console.error('Error enviando resumen diario:', error);
    }
  }

  getStatusEmoji(status) {
    const statusEmojis = {
      'pending': '⏳',
      'confirmed': '✅',
      'preparing': '👨‍🍳',
      'ready': '🎉',
      'delivered': '✅',
      'cancelled': '❌'
    };
    return statusEmojis[status] || '❓';
  }
}

// Función helper para usar desde otros módulos
export const sendOrderToChef = async (orderId, orderInfo) => {
  // Esta función será llamada desde el bot principal
  // Por ahora solo logueamos, luego se integrará con el cliente de WhatsApp
  console.log(`📋 Preparando comanda para cocinero - Pedido #${orderId}`);
  console.log('Detalles:', orderInfo);
  
  // TODO: Integrar con el cliente de WhatsApp cuando esté disponible
  return true;
};

export default ChefNotificationService;
