import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import { generateAIResponse, extractOrderInfo } from './openai.js';
import { saveConversation, createOrder, getConversationHistory } from './database-service.js';
import { sendOrderToChef } from './chef-notifications.js';

class WhatsAppBot {
  constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: process.env.WHATSAPP_SESSION_PATH || './sessions'
      }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    this.conversationStates = new Map(); // Para mantener el estado de cada conversación
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    // Evento cuando se genera el QR
    this.client.on('qr', (qr) => {
      console.log('📱 Escanea este código QR con WhatsApp:');
      qrcode.generate(qr, { small: true });
    });

    // Evento cuando el cliente está listo
    this.client.on('ready', () => {
      console.log('✅ Bot de WhatsApp conectado y listo!');
    });

    // Evento cuando se recibe un mensaje
    this.client.on('message', async (message) => {
      await this.handleMessage(message);
    });

    // Evento de desconexión
    this.client.on('disconnected', (reason) => {
      console.log('❌ Bot desconectado:', reason);
    });
  }

  async handleMessage(message) {
    try {
      // Ignorar mensajes de grupos y mensajes propios
      if (message.from.includes('@g.us') || message.fromMe) {
        return;
      }

      const phoneNumber = message.from.replace('@c.us', '');
      const messageText = message.body;

      console.log(`📨 Mensaje de ${phoneNumber}: ${messageText}`);

      // Guardar mensaje en la base de datos
      await saveConversation(phoneNumber, 'incoming', messageText);

      // Obtener historial de conversación
      const conversationHistory = await getConversationHistory(phoneNumber);

      // Generar respuesta con IA
      const aiResponse = await generateAIResponse(messageText, conversationHistory);

      // Enviar respuesta
      await message.reply(aiResponse);

      // Guardar respuesta en la base de datos
      await saveConversation(phoneNumber, 'outgoing', aiResponse);

      // Verificar si el pedido está completo
      await this.checkAndProcessOrder(phoneNumber, conversationHistory);

    } catch (error) {
      console.error('Error manejando mensaje:', error);
      await message.reply('Disculpa, tengo problemas técnicos. ¿Podrías intentar nuevamente?');
    }
  }

  async checkAndProcessOrder(phoneNumber, conversationHistory) {
    try {
      // Convertir historial a texto para análisis
      const conversationText = conversationHistory
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');

      // Extraer información del pedido
      const orderInfo = await extractOrderInfo(conversationText);

      // Si el pedido está listo para procesar
      if (orderInfo.ready_to_process) {
        console.log('🎯 Pedido completo detectado:', orderInfo);

        // Crear pedido en la base de datos
        const orderId = await createOrder(phoneNumber, orderInfo);

        if (orderId) {
          // Enviar comanda al cocinero
          await sendOrderToChef(orderId, orderInfo);

          // Confirmar al cliente
          const confirmationMessage = this.generateOrderConfirmation(orderInfo, orderId);
          await this.sendMessage(phoneNumber, confirmationMessage);

          // Limpiar estado de conversación
          this.conversationStates.delete(phoneNumber);
        }
      }
    } catch (error) {
      console.error('Error procesando pedido:', error);
    }
  }

  generateOrderConfirmation(orderInfo, orderId) {
    const items = orderInfo.items.map(item => 
      `• ${item.quantity}x ${item.name}`
    ).join('\n');

    return `
✅ *PEDIDO CONFIRMADO #${orderId}*

👤 *Cliente:* ${orderInfo.customer_name}
🍽️ *Pedido:*
${items}

📦 *Servicio:* ${orderInfo.service_type === 'delivery' ? 'Delivery' : 'Take Away'}
${orderInfo.delivery_address ? `📍 *Dirección:* ${orderInfo.delivery_address}` : ''}
💰 *Pago:* ${orderInfo.payment_method}
${orderInfo.scheduled_date ? `📅 *Fecha:* ${orderInfo.scheduled_date}` : '📅 *Para:* Hoy'}

⏱️ *Tiempo estimado:* 30-45 minutos

¡Gracias por elegir Plaza Nadal! 🇪🇸
    `.trim();
  }

  async sendMessage(phoneNumber, message) {
    try {
      const chatId = phoneNumber + '@c.us';
      await this.client.sendMessage(chatId, message);
      
      // Guardar mensaje enviado
      await saveConversation(phoneNumber, 'outgoing', message);
    } catch (error) {
      console.error('Error enviando mensaje:', error);
    }
  }

  async start() {
    try {
      await this.client.initialize();
      console.log('🚀 Iniciando bot de WhatsApp...');
    } catch (error) {
      console.error('Error iniciando bot:', error);
    }
  }

  async stop() {
    try {
      await this.client.destroy();
      console.log('🛑 Bot de WhatsApp detenido');
    } catch (error) {
      console.error('Error deteniendo bot:', error);
    }
  }
}

export default WhatsAppBot;
