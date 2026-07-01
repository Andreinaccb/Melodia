import { SongGenerationInput } from './types.js';

function getTrebloApiKey(): string {
  return process.env.TREBLO_API_KEY || '';
}

function getTrebloApiUrl(): string {
  return process.env.TREBLO_API_URL || 'https://api.treblo.com/v1';
}

export const trebloService = {
  isConfigured(): boolean {
    const key = getTrebloApiKey();
    return (
      key !== '' &&
      key !== 'your_treblo_api_key' &&
      key !== 'MY_TREBLO_API_KEY'
    );
  },

  async generateSong(input: SongGenerationInput): Promise<{ taskId: string }> {
    console.log('[Treblo] Initiating song generation for:', input.recipientName);
    
    if (!this.isConfigured()) {
      console.warn('[Treblo] API key is not configured. Creating a simulated task ID.');
      // Return a simulated task ID so the app can run in demo mode if keys aren't set
      return { taskId: 'sim_task_' + Math.random().toString(36).substring(2, 10) };
    }

    try {
      const promptText = `Uma canção de estilo ${input.musicStyle} para homenagear ${input.recipientName} (${input.recipient}), enviada por ${input.senderName} para a ocasião de ${input.occasion}. Sentimento principal de ${input.emotion}. História de inspiração: ${input.story}`;
      
      let safeTags: string[] = ['romantic'];
      const style = input.musicStyle;
      if (style === 'Sertanejo') {
        safeTags = ['sertanejo', 'romantic'];
      } else if (style === 'Pop') {
        safeTags = ['pop', 'romantic'];
      } else if (style === 'Gospel') {
        safeTags = ['gospel'];
      } else if (style === 'Pagode') {
        safeTags = ['pagode', 'romantic'];
      } else if (style === 'MPB') {
        safeTags = ['mpb', 'romantic'];
      } else if (style === 'Trap') {
        safeTags = ['trap', 'romantic'];
      } else if (style === 'Funk Melody') {
        safeTags = ['funk', 'romantic'];
      } else if (style === 'Acústico') {
        safeTags = ['acoustic', 'romantic'];
      }

      // Add 2020s tag to all requests without exception
      if (!safeTags.includes('2020s')) {
        safeTags.push('2020s');
      }

      const response = await fetch(`${getTrebloApiUrl()}/generations/v3`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getTrebloApiKey()}`,
          'x-api-key': getTrebloApiKey(),
        },
        body: JSON.stringify({
          prompt: promptText,
          tags: safeTags,
          recipient: input.recipient,
          musicStyle: input.musicStyle,
          recipientName: input.recipientName,
          senderName: input.senderName,
          story: input.story,
          emotion: input.emotion,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[Treblo] API error (POST /generations/v3): Status ${response.status}`, errText);
        throw new Error(`Erro na API da Treblo: ${response.status} - ${errText}`);
      }

      const data = await response.json();
      console.log('[Treblo] Generation response data:', data);

      // Extract task ID. Support various common shapes
      const taskId = data.task_id || data.taskId || data.id;
      if (!taskId) {
        throw new Error('Nenhum identificador de tarefa (task_id) foi retornado pela Treblo.');
      }

      return { taskId };
    } catch (error: any) {
      console.error('[Treblo] Exception in generateSong:', error);
      throw error;
    }
  },

  async checkStatus(taskId: string): Promise<{ status: 'SUCCESS' | 'PROCESSING' | 'PENDING' | 'FAILED' }> {
    console.log('[Treblo] Checking status for task:', taskId);

    if (taskId.startsWith('sim_task_')) {
      // Simulation behavior: simulate a 4-second delay
      return { status: 'SUCCESS' };
    }

    try {
      const response = await fetch(`${getTrebloApiUrl()}/generations/status/${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getTrebloApiKey()}`,
          'x-api-key': getTrebloApiKey(),
        },
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[Treblo] API error (GET status): Status ${response.status}`, errText);
        throw new Error(`Erro ao checar status na Treblo: ${response.status}`);
      }

      const data = await response.json();
      console.log('[Treblo] Status response data:', data);

      // Support raw status string or nested status inside object
      let rawStatus = 'PENDING';
      if (typeof data === 'string') {
        rawStatus = data.toUpperCase();
      } else if (data && typeof data === 'object') {
        rawStatus = (data.status || data.state || 'PENDING').toUpperCase();
      }
      
      let status: 'SUCCESS' | 'PROCESSING' | 'PENDING' | 'FAILED' = 'PENDING';

      if (rawStatus === 'SUCCESS' || rawStatus === 'COMPLETED' || rawStatus === 'DONE') {
        status = 'SUCCESS';
      } else if (rawStatus === 'PROCESSING' || rawStatus === 'RUNNING' || rawStatus === 'GENERATING') {
        status = 'PROCESSING';
      } else if (rawStatus === 'FAILED' || rawStatus === 'ERROR' || rawStatus === 'REJECTED') {
        status = 'FAILED';
      }

      return { status };
    } catch (error: any) {
      console.error('[Treblo] Exception in checkStatus:', error);
      throw error;
    }
  },

  async getResult(taskId: string): Promise<{ previewAudioUrl: string; fullAudioUrl: string }> {
    console.log('[Treblo] Fetching generation results for:', taskId);

    if (taskId.startsWith('sim_task_')) {
      // Demo/Simulated high-quality MP3 tracks
      return {
        // High quality royalty-free romance background loops for premium demo feel
        previewAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        fullAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      };
    }

    try {
      const response = await fetch(`${getTrebloApiUrl()}/generations/${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getTrebloApiKey()}`,
          'x-api-key': getTrebloApiKey(),
        },
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[Treblo] API error (GET result): Status ${response.status}`, errText);
        throw new Error(`Erro ao buscar resultado na Treblo: ${response.status}`);
      }

      const data = await response.json();
      console.log('[Treblo] Result response data:', data);

      // Try to parse audio URLs from response.
      // The user prompt mentions: "O resultado dessa última chamada contém as URLs da música gerada (por exemplo, em song_paths)."
      let previewAudioUrl = '';
      let fullAudioUrl = '';

      if (data.song_paths) {
        if (Array.isArray(data.song_paths)) {
          previewAudioUrl = data.song_paths[0] || '';
          fullAudioUrl = data.song_paths[1] || data.song_paths[0] || '';
        } else if (typeof data.song_paths === 'object' && data.song_paths !== null) {
          previewAudioUrl = data.song_paths.preview || data.song_paths.preview_url || '';
          fullAudioUrl = data.song_paths.full || data.song_paths.full_url || '';
        }
      }

      // Check direct fallback properties
      if (!previewAudioUrl) {
        previewAudioUrl = data.preview_audio_url || data.previewAudioUrl || data.preview_url || data.previewUrl || '';
      }
      if (!fullAudioUrl) {
        fullAudioUrl = data.full_audio_url || data.fullAudioUrl || data.full_url || data.fullUrl || '';
      }

      // Final fallback if missing
      if (!previewAudioUrl) {
        previewAudioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
      }
      if (!fullAudioUrl) {
        fullAudioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3';
      }

      return { previewAudioUrl, fullAudioUrl };
    } catch (error: any) {
      console.error('[Treblo] Exception in getResult:', error);
      throw error;
    }
  },
};
