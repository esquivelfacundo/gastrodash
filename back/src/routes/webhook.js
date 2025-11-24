import express from 'express';
import MetaWhatsAppAPI from '../services/meta-api.js';
import { generateAIResponse, extractOrderInfo } from '../services/openai.js';
import { saveConversation, createOrder, getConversationHistory } from '../services/database-service.js';
import { sendOrderToChef } from '../services/chef-notifications.js';

const router = express.Router();
const metaAPI = new MetaWhatsAppAPI();

// Verificación del webhook de Meta
router.get('/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const result = metaAPI.verifyWebhook(mode, token, challenge);
  
  if (result) {
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Forbidden');
  }
});

// Recibir mensajes de Meta
router.post('/whatsapp', async (req, res) => {
  try {
    console.log('🔥 WEBHOOK RECIBIDO DE META - HEADERS:', JSON.stringify(req.headers, null, 2));
    console.log('🔥 WEBHOOK RECIBIDO DE META - BODY:', JSON.stringify(req.body, null, 2));
    
    const messageData = metaAPI.processIncomingMessage(req.body);
    
    if (!messageData) {
      return res.status(200).send('OK');
    }

    const { from, text, contactName } = messageData;
    
    console.log(`📱 Mensaje de ${contactName} (${from}): ${text}`);

    // Guardar mensaje entrante
    await saveConversation(from, 'incoming', text);

    // Obtener historial de conversación
    const conversationHistory = await getConversationHistory(from);

    // Generar respuesta con IA
    const aiResponse = await generateAIResponse(text, conversationHistory);

    // Enviar respuesta vía Meta API
    await metaAPI.sendMessage(from, aiResponse);

    // Guardar respuesta enviada
    await saveConversation(from, 'outgoing', aiResponse);

    // Verificar si el pedido está completo
    await checkAndProcessOrder(from, conversationHistory);

    res.status(200).send('OK');
  } catch (error) {
    console.error('Error procesando webhook:', error);
    res.status(500).send('Error');
  }
});

// Webhook desde Apps Script (fallback/transición)
router.post('/apps-script', async (req, res) => {
  try {
    const { nombre, telefono, texto } = req.body;
    
    console.log(`📨 Mensaje desde Apps Script - ${nombre} (${telefono}): ${texto}`);

    // Procesar igual que Meta webhook
    const phoneNumber = telefono.replace('+', '');
    
    // Guardar mensaje entrante
    await saveConversation(phoneNumber, 'incoming', texto);

    // Obtener historial de conversación
    const conversationHistory = await getConversationHistory(phoneNumber);

    // Generar respuesta con IA
    const aiResponse = await generateAIResponse(texto, conversationHistory);

    // Enviar respuesta vía Meta API
    await metaAPI.sendMessage(phoneNumber, aiResponse);

    // Guardar respuesta enviada
    await saveConversation(phoneNumber, 'outgoing', aiResponse);

    // Verificar si el pedido está completo
    await checkAndProcessOrder(phoneNumber, conversationHistory);

    res.status(200).json({ 
      success: true, 
      message: 'Procesado correctamente',
      response: aiResponse 
    });
  } catch (error) {
    console.error('Error procesando Apps Script:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

async function checkAndProcessOrder(phoneNumber, conversationHistory) {
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
        // Enviar comanda al cocinero vía Meta API
        await sendOrderToChefMeta(orderId, orderInfo);

        // Mensaje simple al cliente
        const waitingMessage = `Estamos consultando con la cocina en cuánto tiempo va a estar tu pedido 👨‍🍳`;

        await metaAPI.sendMessage(phoneNumber, waitingMessage);

        console.log(`📨 Pedido #${orderId} enviado al cocinero - Esperando confirmación`);
      }
    }
  } catch (error) {
    console.error('Error procesando pedido:', error);
  }
}

async function sendOrderToChefMeta(orderId, orderInfo) {
  try {
    const chefPhone = process.env.CHEF_PHONE;
    console.log(`🔧 DEBUG - Número del cocinero: ${chefPhone}`);
    
    if (!chefPhone) {
      console.log('⚠️ Número del cocinero no configurado');
      return;
    }

    const message = formatOrderForChef(orderId, orderInfo);
    console.log(`🔧 DEBUG - Mensaje para cocinero:`, message);
    console.log(`🔧 DEBUG - Enviando a: ${chefPhone}`);
    
    const result = await metaAPI.sendMessage(chefPhone, message);
    console.log(`🔧 DEBUG - Resultado Meta API:`, result);
    
    console.log(`📨 Comanda enviada al cocinero vía Meta API para pedido #${orderId}`);
  } catch (error) {
    console.error('❌ ERROR COMPLETO enviando comanda al cocinero:', error);
  }
}

function formatOrderForChef(orderId, orderInfo) {
  const items = orderInfo.items.map(item => 
    `🍽️ ${item.quantity}x ${item.name}`
  ).join('\n');

  const serviceIcon = orderInfo.service_type === 'delivery' ? '🚚' : '📦';
  const serviceText = orderInfo.service_type === 'delivery' ? 'Delivery' : 'Take Away';

  return `🔔 *NUEVO PEDIDO #${orderId}*

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
⏱️ *DEMORA: [minutos]* - Si hay demora adicional`.trim();
}

function generateOrderConfirmation(orderInfo, orderId) {
  const items = orderInfo.items.map(item => 
    `• ${item.quantity}x ${item.name}`
  ).join('\n');

  return `✅ *PEDIDO CONFIRMADO #${orderId}*

👤 *Cliente:* ${orderInfo.customer_name}
🍽️ *Pedido:*
${items}

📦 *Servicio:* ${orderInfo.service_type === 'delivery' ? 'Delivery' : 'Take Away'}
${orderInfo.delivery_address ? `📍 *Dirección:* ${orderInfo.delivery_address}` : ''}
💰 *Pago:* ${orderInfo.payment_method}
${orderInfo.scheduled_date ? `📅 *Fecha:* ${orderInfo.scheduled_date}` : '📅 *Para:* Hoy'}

⏱️ *Tiempo estimado:* 30-45 minutos

¡Gracias por elegir Plaza Nadal! 🇪🇸`.trim();
}

export default router;
