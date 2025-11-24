import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Contexto del restaurante para la IA
const RESTAURANT_CONTEXT = `
Eres un asistente virtual de Plaza Nadal, un restaurante español familiar con más de 60 años de tradición en Corrientes, Argentina.

INFORMACIÓN DEL RESTAURANTE:
- Nombre: Plaza Nadal
- Especialidad: Comida española auténtica
- Ubicación: H. Irigoyen 2440, Corrientes, Argentina
- Teléfono: +54 379 412-3456

MENÚ DISPONIBLE:
1. Arroz con Pollo - $3,500 (Un favorito de la casa, jugoso y lleno de sabor)
2. Paella Tradicional - $4,200 (El clásico sabor de España con mariscos frescos)
3. Paella Marinera - $4,500 (Paella con mariscos frescos del día)
4. Rabas - $2,800 (Anillos de calamar tiernos y crujientes)
5. Tortilla de Papa - $2,200 (La clásica tortilla argentina, esponjosa y dorada)
6. Tortilla Española - $2,500 (La auténtica tortilla española con chorizo colorado)

SERVICIOS:
- Delivery (con costo adicional según zona)
- Take Away (retiro en el local)

HORARIOS:
- Martes a Domingos: 11:00 a 13:30 hs
- Martes a Sábados: 20:30 a 23:30 hs
- Cerrado los lunes

MÉTODOS DE PAGO:
- Efectivo
- Transferencia bancaria
- (Próximamente: billeteras virtuales)

TU PERSONALIDAD:
- Amable y cálido, como el ambiente familiar del restaurante
- Conocedor de la cocina española
- Eficiente para tomar pedidos
- Siempre dispuesto a ayudar y recomendar

PROCESO DE PEDIDO:
1. Saluda cordialmente
2. Pregunta qué desea pedir
3. Confirma cada item y cantidad
4. Pregunta si es delivery o take away
5. Si es delivery, solicita dirección completa
6. Pregunta método de pago
7. Pregunta si es para hoy o para otro día
8. Confirma todos los datos del pedido
9. Proporciona tiempo estimado de preparación

IMPORTANTE:
- Siempre confirma la disponibilidad antes de finalizar el pedido
- Sé específico con las cantidades y precios
- Mantén un tono profesional pero cálido
- Si no entiendes algo, pide aclaración amablemente
`;

export const generateAIResponse = async (userMessage, conversationHistory = []) => {
  try {
    const messages = [
      { role: 'system', content: RESTAURANT_CONTEXT },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generando respuesta de IA:', error);
    return 'Disculpa, tengo problemas técnicos en este momento. ¿Podrías intentar nuevamente en unos minutos?';
  }
};

// Función para extraer información del pedido usando IA
export const extractOrderInfo = async (conversationText) => {
  try {
    const prompt = `
    Analiza la siguiente conversación y extrae la información del pedido en formato JSON.
    Si falta información importante, indica qué falta.

    Conversación: ${conversationText}

    Responde SOLO con un JSON válido con esta estructura:
    {
      "customer_name": "nombre del cliente o null",
      "items": [{"name": "nombre del producto", "quantity": número}],
      "service_type": "delivery" o "takeaway" o null,
      "delivery_address": "dirección completa o null",
      "payment_method": "efectivo" o "transferencia" o null,
      "scheduled_date": "YYYY-MM-DD o null para hoy",
      "scheduled_time": "HH:MM o null",
      "missing_info": ["lista de información faltante"],
      "ready_to_process": true o false
    }
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.1,
    });

    // Limpiar el contenido de markdown si existe
    let content = completion.choices[0].message.content;
    
    // Remover ```json y ``` si están presentes
    content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    return JSON.parse(content);
  } catch (error) {
    console.error('Error extrayendo información del pedido:', error);
    return {
      ready_to_process: false,
      missing_info: ['Error procesando la información']
    };
  }
};

export default openai;
