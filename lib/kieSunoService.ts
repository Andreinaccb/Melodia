import { SongGenerationInput } from './types.js';
import { GoogleGenAI } from '@google/genai';

function getKieApiKey(): string {
  const key = (process.env.KIE_API_KEY || '').trim();
  if (!key) {
    console.error("[KIE] ERRO: KIE_API_KEY não encontrada no process.env");
  }
  return key;
}

function getKieApiUrl(): string {
  let url = (process.env.KIE_API_URL || 'https://api.kie.ai').trim();
  // Remove trailing slash if exists to avoid double slashes
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  return url;
}

function getGeminiApiKey(): string {
  return process.env.GEMINI_API_KEY || '';
}

function getPublicAppUrl(): string {
  const url = process.env.PUBLIC_APP_URL || process.env.APP_URL || '';
  if (!url) {
    throw new Error("PUBLIC_APP_URL não configurada. A Kie exige callBackUrl público.");
  }
  return url;
}

// Lazy-initialized Gemini Client Utility
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const geminiKey = getGeminiApiKey();
  if (!aiClient && geminiKey) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: geminiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    } catch (err) {
      console.error('[KIE] Failed to initialize Gemini client:', err);
    }
  }
  return aiClient;
}

export const kieSunoService = {
  isConfigured(): boolean {
    const key = getKieApiKey();
    return (
      key !== '' &&
      key !== 'your_kie_api_key' &&
      key !== 'MY_KIE_API_KEY'
    );
  },

  async generateLyricsWithGemini(input: SongGenerationInput): Promise<string> {
    const ai = getGeminiClient();
    if (!ai) {
      console.log('[KIE] Gemini client not configured. Using deterministic template for lyrics.');
      return this.generateDeterministicLyrics(input);
    }

    try {
      console.log('[KIE] Generating lyrics with Gemini 3.5 Flash...');
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Você é um Compositor e Letrista de Elite, vencedor de prêmios de poesia e música. Sua especialidade é a "Alquimia Lírica": transformar relatos brutos e simples em composições profundas, viscerais e extremamente emocionantes.
    
Seu objetivo é criar a letra de uma música em Português (Brasil). O usuário fornecerá uma história, mas você NÃO deve apenas rimar o que ele escreveu. Você deve interpretar a alma do relato.

DETALHES DA COMPOSIÇÃO:
- Estilo Musical: ${input.musicStyle}
- Emoção Central: ${input.emotion}
- Homenageado(a): ${input.recipientName}
- A História (Apenas como base): ${input.story}

MANUAL DE ESTILO E QUALIDADE:
1. PROIBIÇÃO DE LITERALIDADE: Não use as frases exatas da história. Se o usuário diz "nós nos conhecemos na chuva", você escreve "o céu chorava alegria no dia em que nossos caminhos se cruzaram". Use sinônimos, analogias e metáforas.
2. IMAGENS SENSORIAIS: Descreva sentimentos através de sensações. Use o tato, o olhar, o silêncio. Faça o ouvinte "sentir" a cena.
3. VOCABULÁRIO RICO: Evite rimas óbvias ou infantis. Busque palavras que tragam elegância e profundidade à canção.
4. ESTRUTURA PROFISSIONAL: Organize em [Verse 1], [Chorus], [Verse 2], [Chorus], [Bridge], [Chorus], [Outro]. Cada seção deve ter uma progressão narrativa.
5. ADAPTAÇÃO AO ESTILO: Se for Rock, use força e intensidade. Se for MPB, use sofisticação e suavidade. Se for Sertanejo, use a verdade do cotidiano com poesia.

REGRAS DE OURO:
- Responda APENAS com a letra. 
- NENHUM título, introdução ou comentário.
- A música deve soar como se tivesse sido escrita por um grande artista brasileiro.`,
      });

      if (response.text) {
        const lyrics = response.text.trim();
        console.log('[KIE] Gemini lyrics generated successfully:\n', lyrics.substring(0, 150) + '...');
        return lyrics;
      }
    } catch (error: any) {
      console.error('[KIE] Gemini lyric generation failed. Falling back to deterministic lyrics:', error.message);
    }

    return this.generateDeterministicLyrics(input);
  },

  generateDeterministicLyrics(input: SongGenerationInput): string {
    return `[Verse 1]
Para ${input.recipientName}
Lembro de cada detalhe do que passamos
A nossa história escrita em cada detalhe, cada canção
${input.story}

[Chorus]
E hoje celebro com você esse momento especial
Nossa melodia em tom de ${input.emotion}
Você é tudo que sempre sonhei, meu porto seguro
Uma canção de ${input.musicStyle} para te guiar no escuro

[Verse 2]
O carinho que nos une ultrapassa qualquer barreira
Saber que te tenho ao meu lado me faz flutuar
Cada palavra que digo vem do fundo do meu peito
Nosso amor é perfeito, do nosso jeito

[Chorus]
E hoje celebro com você esse momento especial
Nossa melodia em tom de ${input.emotion}
Você é tudo que sempre sonhei, meu porto seguro
Uma canção de ${input.musicStyle} para te guiar no escuro

[Outro]
Para ${input.recipientName}.
Nossa melodia eterna.`;
  },

  async generateSong(input: SongGenerationInput): Promise<{ taskId: string }> {
    console.log('[KIE] Iniciando geração de música para:', input.recipientName);

    // 1. Debug Environment Variables
    const apiKey = getKieApiKey();
    const apiUrl = getKieApiUrl();
    
    console.log("[KIE] URL Base:", apiUrl);
    console.log("[KIE] API KEY exists:", !!apiKey);
    if (!apiKey) {
      throw new Error("KIE_API_KEY não configurada. A Kie exige autenticação.");
    }
    console.log("[KIE] API KEY length:", apiKey.length);
    console.log("[KIE] API KEY prefix:", apiKey.substring(0, 8));

    if (!this.isConfigured()) {
      console.warn('[KIE] API Key não configurada corretamente. Verifique se não é um placeholder.');
    }

    // Get public app url
    const publicAppUrl = (process.env.PUBLIC_APP_URL || '').trim() || (process.env.APP_URL || '').trim();
    if (!publicAppUrl || publicAppUrl.includes('localhost') || publicAppUrl === '1') {
      throw new Error("PUBLIC_APP_URL não configurada ou inválida. A Kie exige callBackUrl público.");
    }

    const callbackUrlVal = `${process.env.PUBLIC_APP_URL}/api/kie-callback`;
    console.log('[KIE] callBackUrl enviado:', callbackUrlVal);

    // 2. Generate/Optimize lyrics
    const lyrics = await this.generateLyricsWithGemini(input);

    // 3. Prepare payload
    const payload = {
      prompt: lyrics,
      customMode: true,
      instrumental: false,
      model: 'V4',
      callBackUrl: callbackUrlVal,
      style: input.musicStyle,
      title: `Melodia para ${input.recipientName}`,
      negativeTags: 'Heavy Metal, Screamo, Distorted Vocals, Low Quality, Instrumental Only',
      vocalGender: input.vocalGender,
    };

    const url = `${apiUrl}/api/v1/generate`;
    const headers = {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Accept": "application/json"
    };

    // 4. Log Complete Request
    console.log("[KIE] Request URL:", url);
    console.log("[KIE] Request Headers:", {
       ...headers,
       Authorization: `Bearer ${apiKey.substring(0, 8)}...`
    });
    console.log("[KIE] Payload:", JSON.stringify(payload, null, 2));

    try {
      // 5. Execute with Fetch
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log("[KIE] HTTP Status:", response.status);
      console.log("[KIE] Raw Response:", responseText);

      if (!response.ok) {
        console.error(`[KIE] Erro na API (Status ${response.status}):`, responseText);
        throw new Error(`Erro na API Kie: ${response.status} - ${responseText}`);
      }

      let responseData: any;
      try {
        responseData = JSON.parse(responseText);
      } catch (err) {
        console.error('[KIE] Falha ao fazer parse do JSON da resposta:', err);
        throw new Error(`Resposta inválida da API Kie (esperado JSON): ${responseText}`);
      }

      // Check for application-level error code
      if (responseData.code !== 200) {
        throw new Error(`[KIE] API error: ${responseData.msg || 'Unknown error'}`);
      }

      const taskId = responseData?.data?.taskId;

      if (!taskId || typeof taskId !== "string") {
        console.error("[KIE] Resposta sem taskId:", JSON.stringify(responseData, null, 2));
        throw new Error("Nenhum identificador de tarefa foi retornado pela API Kie.");
      }

      console.log("[KIE] taskId extraído com sucesso:", taskId);
      return { taskId };
    } catch (error: any) {
      console.error('[KIE] Erro crítico durante a chamada para a Kie:', error);
      throw error;
    }
  },

  async checkStatus(taskId: string): Promise<{ status: 'SUCCESS' | 'PROCESSING' | 'PENDING' | 'FAILED' }> {
    console.log('[KIE] Verificando status para task:', taskId);

    if (taskId.startsWith('sim_kie_')) {
      return { status: 'SUCCESS' };
    }

    const apiKey = getKieApiKey();
    const apiUrl = getKieApiUrl();

    try {
      const url = `${apiUrl}/api/v1/generate/record-info?taskId=${taskId}`;
      const headers = {
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json"
      };

      console.log("[KIE Status Check] Request URL:", url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      const responseText = await response.text();
      console.log('[KIE Status Check] HTTP Status:', response.status);

      if (!response.ok) {
        console.error(`[KIE Status Check] Erro ao checar status (Status ${response.status}):`, responseText);
        throw new Error(`Erro ao buscar status na Kie: ${response.status} - ${responseText}`);
      }

      let body: any;
      try {
        body = JSON.parse(responseText);
        console.log("[KIE Status Check] Raw response:", JSON.stringify(body, null, 2));
      } catch (err) {
        console.error('[KIE Status Check] Falha ao fazer parse do JSON da resposta:', err);
        throw new Error(`Resposta de status inválida da API Kie: ${responseText}`);
      }

      const code = body.code;
      const kieData = body.data || {};
      const msg = body.msg || '';
      
      // Extraction rules based on user requirements
      const rawStatus = (kieData.status || '').toUpperCase();
      const hasSunoData = kieData.response?.sunoData && Array.isArray(kieData.response.sunoData) && kieData.response.sunoData.length > 0;
      
      let tracks: any[] = [];
      if (hasSunoData) {
        tracks = kieData.response.sunoData;
      } else if (Array.isArray(kieData.data)) {
        tracks = kieData.data;
      }

      // Find a track with any valid audio field (camelCase or snake_case)
      const validTrack = tracks.find(track =>
        track?.audioUrl ||
        track?.streamAudioUrl ||
        track?.sourceAudioUrl ||
        track?.sourceStreamAudioUrl ||
        track?.audio_url ||
        track?.stream_audio_url
      );

      // 1. Success check: responseData.data.status = "SUCCESS" and found audio in responseData.data.response.sunoData (or validTrack fallback)
      if (rawStatus === 'SUCCESS' && (hasSunoData || validTrack)) {
        return { status: 'SUCCESS' };
      }

      console.log(`[KIE Status Check] Raw status identified: ${rawStatus}`);

      // Continue polling
      const pollingStatuses = ['PENDING', 'TEXT_SUCCESS', 'FIRST_SUCCESS', 'PROCESSING', 'RUNNING', 'QUEUED', ''];
      if (pollingStatuses.includes(rawStatus) || !rawStatus) {
        return { status: 'PROCESSING' };
      }

      // Fail status
      const failStatuses = ['CREATE_TASK_FAILED', 'GENERATE_AUDIO_FAILED', 'CALLBACK_EXCEPTION', 'SENSITIVE_WORD_ERROR', 'FAILED', 'ERROR'];
      if (failStatuses.includes(rawStatus) || code === 501 || kieData.callbackType === 'error') {
        console.error('[KIE Status Check] Falha reportada pela API:', msg || rawStatus);
        return { status: 'FAILED' };
      }

      return { status: 'PROCESSING' };
    } catch (error: any) {
      console.error('[KIE] Erro ao checar status:', error);
      throw error;
    }
  },

  async getResult(taskId: string): Promise<{ 
    previewAudioUrl: string; 
    fullAudioUrl: string;
    imageUrl?: string;
    title?: string;
    duration?: number;
  }> {
    console.log('[KIE] Buscando resultados da geração:', taskId);

    if (taskId.startsWith('sim_kie_')) {
      return {
        previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        fullAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        imageUrl: 'https://placehold.co/600x400/png',
        title: 'Melodia Simulada',
        duration: 180
      };
    }

    const apiKey = getKieApiKey();
    const apiUrl = getKieApiUrl();

    try {
      const url = `${apiUrl}/api/v1/generate/record-info?taskId=${taskId}`;
      const headers = {
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json"
      };

      console.log("[KIE Get Result] Request URL:", url);

      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      const responseText = await response.text();
      console.log('[KIE Get Result] HTTP Status:', response.status);

      if (!response.ok) {
        console.error(`[KIE Get Result] Erro ao buscar resultado (Status ${response.status}):`, responseText);
        throw new Error(`Erro ao obter áudio na Kie: ${response.status} - ${responseText}`);
      }

      let body: any;
      try {
        body = JSON.parse(responseText);
        console.log("[KIE Get Result] Raw response:", JSON.stringify(body, null, 2));
      } catch (err) {
        console.error('[KIE Get Result] Falha ao fazer parse do JSON da resposta:', err);
        throw new Error(`Resposta de resultado inválida da API Kie: ${responseText}`);
      }

      const code = body.code;
      const kieData = body.data || {};
      
      let tracks: any[] = [];
      if (kieData.response && Array.isArray(kieData.response.sunoData)) {
        tracks = kieData.response.sunoData;
      } else if (Array.isArray(kieData.data)) {
        tracks = kieData.data;
      }

      const validTrack = tracks.find(track =>
        track?.streamAudioUrl ||
        track?.audioUrl ||
        track?.stream_audio_url ||
        track?.audio_url ||
        track?.sourceStreamAudioUrl ||
        track?.sourceAudioUrl
      ) || tracks[0];

      if (code === 200 && validTrack) {
        const previewAudioUrl =
          validTrack.streamAudioUrl ||
          validTrack.audioUrl ||
          validTrack.stream_audio_url ||
          validTrack.audio_url ||
          validTrack.sourceStreamAudioUrl ||
          validTrack.sourceAudioUrl;

        const fullAudioUrl =
          validTrack.audioUrl ||
          validTrack.streamAudioUrl ||
          validTrack.audio_url ||
          validTrack.stream_audio_url ||
          validTrack.sourceAudioUrl ||
          validTrack.sourceStreamAudioUrl;

        const imageUrl =
          validTrack.imageUrl ||
          validTrack.image_url ||
          validTrack.sourceImageUrl;

        console.log('[KIE] URL de áudio encontrada:', previewAudioUrl);

        return {
          previewAudioUrl,
          fullAudioUrl,
          imageUrl,
          title: validTrack.title,
          duration: validTrack.duration
        };
      }

      throw new Error('Nenhuma trilha de áudio encontrada na resposta da Kie.');
    } catch (error: any) {
      console.error('[KIE] Erro ao buscar resultado:', error);
      throw error;
    }
  },
};
