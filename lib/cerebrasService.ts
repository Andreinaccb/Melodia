import { SongGenerationInput } from './types.js';

const CEREBRAS_API_URL = 'https://api.cerebras.ai/v1/chat/completions';

export const cerebrasService = {
  isConfigured(): boolean {
    return (process.env.CEREBRAS_API_KEY || '') !== '';
  },

  async generateLyrics(input: SongGenerationInput): Promise<string> {
    const rawModel = process.env.CEREBRAS_MODEL?.trim() || "llama3.1-70b";
    
    // Normalization mapping
    const normalizeModelName = (name: string): string => {
      const lower = name.toLowerCase();
      // Specific mappings for display names to technical IDs
      if (lower.includes("z.ai glm 4.7")) return "zai-glm-4.7";
      if (lower.includes("gpt oss 120b")) return "gpt-oss-120b";
      if (lower.includes("gemma 4 31b")) return "gemma-4-31b";
      
      // If it already looks like a technical ID (contains hyphens and no spaces), keep it
      if (name.includes("-") && !name.includes(" ")) return name;

      // Fallback: simple normalization (lowercase, replace spaces with hyphens, remove dots)
      return lower.trim().replace(/\s+/g, '-').replace(/\./g, '');
    };

    const cerebrasModel = normalizeModelName(rawModel);
    const apiKey = process.env.CEREBRAS_API_KEY || '';
    
    if (!apiKey) {
      console.warn('[CEREBRAS] API Key not configured');
      return '';
    }

    console.log("[CEREBRAS] CEREBRAS_MODEL env exists:", !!process.env.CEREBRAS_MODEL);
    console.log("[CEREBRAS] CEREBRAS_MODEL raw value:", rawModel);
    console.log("[CEREBRAS] Normalized model used:", cerebrasModel);
    console.log("[CEREBRAS] Starting lyrics generation");

    try {
      const response = await fetch(CEREBRAS_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: cerebrasModel,
          messages: [
            {
              role: 'system',
              content: `Você é um Compositor e Letrista de Elite, especialista em transformar histórias reais em poesias musicais arrebatadoras. Seu objetivo é criar a letra de uma música em Português (Brasil) otimizada para o modelo Z.ai GLM 4.7.

DIRETRIZES ARTÍSTICAS (LYRIC ENVOLVENTE):
1. EQUILÍBRIO ARTÍSTICO: Não apenas reconte os fatos de forma literal, mas garanta que os elementos centrais e detalhes marcantes da história do usuário estejam presentes e sejam facilmente reconhecíveis através de metáforas e imagens poéticas.
2. ENVOLVIMENTO EMOCIONAL: A letra deve ser emocionante e envolvente. Evite frases genéricas ou burocráticas; use palavras evocativas que toquem o coração.
3. MÉTRICA E RITMO: Cada linha deve ter uma cadência musical fluida e natural para o estilo ${input.musicStyle}.
4. ESQUEMA DE RIMAS: Utilize rimas ricas, sonoras e bem encaixadas, evitando o óbvio.
5. ESTRUTURA: [Verse 1], [Chorus], [Verse 2], [Chorus], [Bridge], [Chorus], [Outro].

REGRAS CRÍTICAS:
- Foco total na alma da música e na qualidade artística 'Premium'.
- Responda APENAS com a letra da música, formatada por blocos.
- Sem títulos, introduções ou comentários adicionais.`
            },
            {
              role: 'user',
              content: `Solicitação de Música:
Estilo: ${input.musicStyle}
Emoção/Clima: ${input.emotion}
Homenageado(a): ${input.recipientName}
História Base (Essência da letra): ${input.story}`
            }
          ],
          temperature: 0.7,
        }),
      });

      console.log('[CEREBRAS] Request sent');

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Cerebras API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`Cerebras API Error: ${data.error.message || JSON.stringify(data.error)}`);
      }

      const lyrics = data.choices?.[0]?.message?.content || '';

      if (lyrics) {
        console.log('[CEREBRAS] Lyrics generated');
        return lyrics.trim();
      }

      return '';
    } catch (error) {
      console.error('[CEREBRAS] Error:', error);
      return '';
    }
  }
};
