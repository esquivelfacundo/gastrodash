import dotenv from 'dotenv';
import { initializeDatabase } from './config/database.js';
import WhatsAppBot from './services/whatsapp.js';
import WebServer from './web/server.js';
import cron from 'node-cron';

// Cargar variables de entorno
dotenv.config();

class PlazaNadalBot {
  constructor() {
    this.whatsappBot = null;
    this.webServer = null;
  }

  async start() {
    try {
      console.log('🚀 Iniciando Plaza Nadal Bot System...');
      
      // Inicializar base de datos
      console.log('📊 Inicializando base de datos...');
      await initializeDatabase();
      
      // Iniciar servidor web
      console.log('🌐 Iniciando servidor web...');
      this.webServer = new WebServer();
      await this.webServer.start();
      
      // Iniciar bot de WhatsApp (DESACTIVADO - usando Meta API)
      // console.log('📱 Iniciando bot de WhatsApp...');
      // this.whatsappBot = new WhatsAppBot();
      // await this.whatsappBot.start();
      
      // Configurar tareas programadas
      this.setupScheduledTasks();
      
      console.log('✅ Sistema Plaza Nadal Bot iniciado correctamente!');
      console.log(`📱 Panel del cocinero: http://localhost:${process.env.PORT || 3000}`);
      console.log('📞 Esperando conexión de WhatsApp...');
      
    } catch (error) {
      console.error('❌ Error iniciando el sistema:', error);
      process.exit(1);
    }
  }

  setupScheduledTasks() {
    // Enviar resumen diario al cocinero cada mañana a las 9:00
    cron.schedule('0 9 * * *', async () => {
      console.log('📅 Enviando resumen diario al cocinero...');
      // TODO: Implementar cuando el bot esté completamente integrado
    });

    // Limpiar conversaciones antiguas cada domingo a las 2:00 AM
    cron.schedule('0 2 * * 0', async () => {
      console.log('🧹 Limpiando conversaciones antiguas...');
      // TODO: Implementar limpieza de datos antiguos
    });
  }

  async stop() {
    try {
      console.log('🛑 Deteniendo Plaza Nadal Bot System...');
      
      if (this.whatsappBot) {
        await this.whatsappBot.stop();
      }
      
      if (this.webServer) {
        await this.webServer.stop();
      }
      
      console.log('✅ Sistema detenido correctamente');
    } catch (error) {
      console.error('❌ Error deteniendo el sistema:', error);
    }
  }
}

// Crear instancia del sistema
const plazaNadalBot = new PlazaNadalBot();

// Manejar señales de terminación
process.on('SIGINT', async () => {
  console.log('\n🔄 Recibida señal de terminación...');
  await plazaNadalBot.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Recibida señal de terminación...');
  await plazaNadalBot.stop();
  process.exit(0);
});

// Manejar errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Excepción no capturada:', error);
  process.exit(1);
});

// Iniciar el sistema
plazaNadalBot.start();
