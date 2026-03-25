"use client";

import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState, 
  makeCacheableSignalKeyStore,
  WASocket
} from '@whiskeysockets/baileys';
import pino from 'pino';
import { Boom } from '@hapi/boom';

// Contorno para o erro de tipagem na versão 7.0.0-rc.9
const { makeInMemoryStore } = require('@whiskeysockets/baileys');

// Logger para o Baileys
const logger = pino({ level: 'silent' });

/**
 * Gerenciador de conexões Baileys.
 */
export class BaileysManager {
  private static instances: Map<string, WASocket> = new Map();

  static async getSession(sessionId: string): Promise<WASocket> {
    if (this.instances.has(sessionId)) {
      return this.instances.get(sessionId)!;
    }

    const { state, saveCreds } = await useMultiFileAuthState(`sessions/${sessionId}`);

    const sock = makeWASocket({
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger),
      },
      printQRInTerminal: false,
      logger,
    });

    // Inicializa o Store em memória para capturar Contatos, Chats e Mensagens
    const store = makeInMemoryStore({ logger });
    store.bind(sock.ev);
    
    // Anexa o store ao objeto sock burlando o TypeScript para facilitar o acesso nas rotas
    (sock as any).store = store;

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