"use client";

import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState, 
  makeCacheableSignalKeyStore,
  AuthenticationState,
  WASocket
} from '@whiskeysockets/baileys';
import pino from 'pino';
import { Boom } from '@hapi/boom';

// Logger para o Baileys
const logger = pino({ level: 'silent' });

/**
 * Gerenciador de conexões Baileys.
 * Como o QR Code é tratado externamente, aqui focamos em usar sessões existentes
 * ou inicializar ações específicas.
 */
export class BaileysManager {
  private static instances: Map<string, WASocket> = new Map();

  /**
   * Inicializa ou recupera uma instância do socket para uma sessão específica.
   * Em um cenário real, você buscaria os dados de autenticação do MongoDB.
   */
  static async getSession(sessionId: string): Promise<WASocket> {
    if (this.instances.has(sessionId)) {
      return this.instances.get(sessionId)!;
    }

    // Nota: Aqui estamos usando useMultiFileAuthState por simplicidade, 
    // mas o ideal seria um AuthState customizado que lê do MongoDB.
    const { state, saveCreds } = await useMultiFileAuthState(`sessions/${sessionId}`);

    const sock = makeWASocket({
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger),
      },
      printQRInTerminal: false,
      logger,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        if (shouldReconnect) {
          this.instances.delete(sessionId);
        }
      }
    });

    this.instances.set(sessionId, sock);
    return sock;
  }
}