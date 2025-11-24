import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

class MetaWhatsAppAPI {
  constructor() {
    this.accessToken = process.env.META_ACCESS_TOKEN;
    this.phoneNumberId = process.env.META_PHONE_NUMBER_ID;
    this.apiVersion = 'v21.0';
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`;
  }

  async sendMessage(to, message) {
    try {
      const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;
      
      const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: {
          body: message
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('Error enviando mensaje Meta:', result);
        throw new Error(`Meta API Error: ${result.error?.message || 'Unknown error'}`);
      }

      console.log('✅ Mensaje enviado vía Meta API:', result);
      return result;
    } catch (error) {
      console.error('Error en Meta API:', error);
      throw error;
    }
  }

  async sendTemplate(to, templateName, parameters = []) {
    try {
      const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;
      
      const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: 'es_AR'
          },
          components: parameters.length > 0 ? [{
            type: 'body',
            parameters: parameters.map(param => ({
              type: 'text',
              text: param
            }))
          }] : []
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('Error enviando template Meta:', result);
        throw new Error(`Meta API Error: ${result.error?.message || 'Unknown error'}`);
      }

      console.log('✅ Template enviado vía Meta API:', result);
      return result;
    } catch (error) {
      console.error('Error enviando template:', error);
      throw error;
    }
  }

  // Verificar webhook de Meta
  verifyWebhook(mode, token, challenge) {
    const verifyToken = process.env.META_VERIFY_TOKEN;
    
    if (mode === 'subscribe' && token === verifyToken) {
      console.log('✅ Webhook verificado correctamente');
      return challenge;
    } else {
      console.error('❌ Error verificando webhook');
      return null;
    }
  }

  // Procesar mensaje entrante de Meta
  processIncomingMessage(body) {
    try {
      if (body.object !== 'whatsapp_business_account') {
        return null;
      }

      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      if (changes?.field !== 'messages') {
        return null;
      }

      // Ignorar webhooks de status (delivered, read, etc.)
      if (value?.statuses) {
        console.log('📋 Status webhook ignorado:', value.statuses[0]?.status);
        return null;
      }

      const messages = value?.messages;
      if (!messages || messages.length === 0) {
        return null;
      }

      const message = messages[0];
      const contact = value?.contacts?.[0];

      return {
        messageId: message.id,
        from: message.from,
        timestamp: message.timestamp,
        type: message.type,
        text: message.text?.body || '',
        contactName: contact?.profile?.name || 'Usuario',
        waId: contact?.wa_id
      };
    } catch (error) {
      console.error('Error procesando mensaje de Meta:', error);
      return null;
    }
  }
}

export default MetaWhatsAppAPI;
