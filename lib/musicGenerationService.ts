import { SongGenerationInput } from './types.js';
import { kieSunoService } from './kieSunoService.js';
import { trebloService } from './trebloService.js';

export const musicGenerationService = {
  async generateSong(input: SongGenerationInput): Promise<{ provider: 'kie' | 'treblo'; taskId: string }> {
    console.log('[MUSIC GENERATION] Iniciando processo de geração para:', input.recipientName);

    // Standardized Logs for Cerebras
    const cerebrasModel = process.env.CEREBRAS_MODEL?.trim() || "llama3.1-70b";
    console.log("[MUSIC GENERATION] CEREBRAS_MODEL env exists:", !!process.env.CEREBRAS_MODEL);
    console.log("[MUSIC GENERATION] CEREBRAS_MODEL value:", process.env.CEREBRAS_MODEL?.trim());
    console.log("[MUSIC GENERATION] Model actually used:", cerebrasModel);

    // 1. Try KIE first if configured (or simulate if nothing is configured, since Kie is preferred)
    const isKieConfigured = kieSunoService.isConfigured();
    const isTrebloConfigured = trebloService.isConfigured();

    if (isKieConfigured || !isTrebloConfigured) {
      try {
        console.log('[KIE] Iniciando geração principal...');
        const result = await kieSunoService.generateSong(input);
        console.log('[KIE] Resposta de sucesso recebida com taskId:', result.taskId);
        return { provider: 'kie', taskId: result.taskId };
      } catch (kieError: any) {
        console.error('[KIE] Geração principal falhou:', kieError.message);
        console.log('[TREBLO FALLBACK] Iniciando fallback...');
        
        try {
          const result = await trebloService.generateSong(input);
          console.log('[TREBLO FALLBACK] Sucesso com taskId:', result.taskId);
          return { provider: 'treblo', taskId: result.taskId };
        } catch (trebloError: any) {
          console.error('[TREBLO FALLBACK] Geração de fallback também falhou:', trebloError.message);
          console.error('[MUSIC GENERATION] Falha em todos os provedores.');
          throw new Error('Não foi possível gerar a música em nenhum dos nossos servidores. Por favor, tente novamente mais tarde.');
        }
      }
    } else {
      // If Kie is not configured but Treblo is, go straight to Treblo
      try {
        console.log('[TREBLO FALLBACK] KIE não está configurada, mas Treblo está. Iniciando diretamente via Treblo...');
        const result = await trebloService.generateSong(input);
        console.log('[TREBLO FALLBACK] Sucesso com taskId:', result.taskId);
        return { provider: 'treblo', taskId: result.taskId };
      } catch (trebloError: any) {
        console.error('[TREBLO FALLBACK] Geração via Treblo falhou:', trebloError.message);
        console.error('[MUSIC GENERATION] Falha em todos os provedores.');
        throw new Error('Não foi possível gerar a música em nossos servidores. Por favor, tente novamente mais tarde.');
      }
    }
  },

  async checkStatus(provider: 'kie' | 'treblo', taskId: string): Promise<{ status: 'SUCCESS' | 'PROCESSING' | 'PENDING' | 'FAILED' }> {
    if (provider === 'kie') {
      try {
        return await kieSunoService.checkStatus(taskId);
      } catch (err: any) {
        console.error('[MUSIC GENERATION] Erro ao checar status na Kie:', err.message);
        // If checking status of Kie fails completely, we can't easily "fallback" mid-polling to a new generation,
        // but we return FAILED so the frontend can restart or prompt user.
        throw err;
      }
    } else {
      return await trebloService.checkStatus(taskId);
    }
  },

  async getResult(provider: 'kie' | 'treblo', taskId: string): Promise<{ 
    previewAudioUrl: string; 
    fullAudioUrl: string;
    imageUrl?: string;
    title?: string;
    duration?: number;
  }> {
    if (provider === 'kie') {
      return await kieSunoService.getResult(taskId);
    } else {
      return await trebloService.getResult(taskId);
    }
  },
};
