import React, { useState } from 'react';
import { User, Music, MessageSquare, Sparkles, Heart, Gift, Mic } from 'lucide-react';
import { SongGenerationInput, RecipientType, MusicStyleType, OccasionType, EmotionType } from '../types';
import PremiumSelect from './ui/PremiumSelect';

interface StepFormProps {
  onSubmit: (data: SongGenerationInput) => void;
}

const recipientOptions = [
  { value: 'Namorado(a)', label: 'Namorado(a)' },
  { value: 'Esposo(a)', label: 'Esposo(a)' },
  { value: 'Filho(a)', label: 'Filho(a)' },
  { value: 'Mãe/Pai', label: 'Mãe/Pai' },
  { value: 'Amigo(a)', label: 'Amigo(a)' },
  { value: 'Outro', label: 'Outro' },
];

const musicStyleOptions = [
  { value: 'Sertanejo', label: 'Sertanejo' },
  { value: 'Pop', label: 'Pop' },
  { value: 'Gospel', label: 'Gospel' },
  { value: 'Pagode', label: 'Pagode' },
  { value: 'MPB', label: 'MPB' },
  { value: 'Trap', label: 'Trap' },
  { value: 'Funk Melody', label: 'Funk Melody' },
  { value: 'Acústico', label: 'Acústico' },
  { value: 'Outro', label: 'Outro' },
];

const emotionOptions = [
  { value: 'Romance', label: 'Romântico' },
  { value: 'Amor', label: 'Emocionante' },
  { value: 'Saudade', label: 'Saudade' },
  { value: 'Gratidão', label: 'Gratidão' },
  { value: 'Superação', label: 'Superação' },
  { value: 'Alegria', label: 'Alegre' },
  { value: 'Fé', label: 'Fé' },
];

export default function StepForm({ onSubmit }: StepFormProps) {
  const [recipient, setRecipient] = useState<RecipientType>('Namorado(a)');
  const [musicStyle, setMusicStyle] = useState<MusicStyleType>('Sertanejo');
  const [recipientName, setRecipientName] = useState('');
  const [emotion, setEmotion] = useState<EmotionType>('Romance');
  const [vocalGender, setVocalGender] = useState<'m' | 'f'>('f');
  const [story, setStory] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const tempErrors: Record<string, string> = {};
    if (!recipientName.trim()) tempErrors.recipientName = 'Nome da pessoa homenageada é obrigatório';
    if (!story.trim()) tempErrors.story = 'Conte um pouco da história de vocês';
    else if (story.trim().length < 15) tempErrors.story = 'A história precisa de pelo menos 15 caracteres.';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        recipient,
        musicStyle,
        recipientName,
        story,
        emotion,
        vocalGender,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="font-serif text-3xl text-premium-title font-bold text-center mb-10 tracking-tight">
        Detalhes da Homenagem
      </h3>

      {/* Row 1: Pessoa homenageada & Nome */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex flex-col space-y-2.5">
          <label className="text-[10px] font-bold tracking-[0.2em] text-premium-label uppercase flex items-center gap-2.5 ml-1">
            <Heart className="w-3.5 h-3.5 text-brand-pink" />
            Pessoa homenageada
          </label>
          <PremiumSelect
            value={recipient}
            onValueChange={(val) => setRecipient(val as RecipientType)}
            options={recipientOptions}
            placeholder="Selecione..."
          />
        </div>

        <div className="flex flex-col space-y-2.5">
          <label className="text-[10px] font-bold tracking-[0.2em] text-premium-label uppercase flex items-center gap-2.5 ml-1">
            <Sparkles className="w-3.5 h-3.5 text-brand-pink-soft" />
            Nome
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Nome da pessoa"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className={`w-full h-14 premium-input rounded-2xl text-[15px] px-5 font-medium ${
                errors.recipientName ? 'border-red-500/50 focus:border-red-500' : ''
              }`}
            />
            {errors.recipientName && (
              <span className="text-[10px] text-red-500 mt-2 block absolute font-bold ml-1">{errors.recipientName}</span>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Estilo musical & Clima da música */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
        <div className="flex flex-col space-y-2.5">
          <label className="text-[10px] font-bold tracking-[0.2em] text-premium-label uppercase flex items-center gap-2.5 ml-1">
            <Music className="w-3.5 h-3.5 text-brand-pink" />
            Estilo musical
          </label>
          <PremiumSelect
            value={musicStyle}
            onValueChange={(val) => setMusicStyle(val as MusicStyleType)}
            options={musicStyleOptions}
            placeholder="Selecione..."
          />
        </div>

        <div className="flex flex-col space-y-2.5">
          <label className="text-[10px] font-bold tracking-[0.2em] text-premium-label uppercase flex items-center gap-2.5 ml-1">
            <Heart className="w-3.5 h-3.5 text-brand-pink" />
            Clima da música
          </label>
          <PremiumSelect
            value={emotion}
            onValueChange={(val) => setEmotion(val as EmotionType)}
            options={emotionOptions}
            placeholder="Selecione..."
          />
        </div>
      </div>

      {/* Row 3: Voz do cantor */}
      <div className="flex flex-col space-y-2.5">
        <label className="text-[10px] font-bold tracking-[0.2em] text-premium-label uppercase flex items-center gap-2.5 ml-1">
          <Mic className="w-3.5 h-3.5 text-brand-pink" />
          Voz do cantor(a)
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setVocalGender('f')}
            className={`h-14 rounded-2xl transition-all text-sm font-bold flex items-center justify-center gap-2.5 ${
              vocalGender === 'f'
                ? 'gender-btn-active'
                : 'gender-btn-inactive'
            }`}
          >
            Feminina
          </button>
          <button
            type="button"
            onClick={() => setVocalGender('m')}
            className={`h-14 rounded-2xl transition-all text-sm font-bold flex items-center justify-center gap-2.5 ${
              vocalGender === 'm'
                ? 'gender-btn-active'
                : 'gender-btn-inactive'
            }`}
          >
            Masculina
          </button>
        </div>
      </div>

      {/* Row 5: A história de vocês */}
      <div className="flex flex-col space-y-2.5">
        <label className="text-[10px] font-bold tracking-[0.2em] text-premium-label uppercase flex items-center gap-2.5 ml-1">
          <MessageSquare className="w-3.5 h-3.5 text-brand-pink" />
          A história de vocês
        </label>
        <div className="relative">
          <textarea
            rows={4}
            placeholder="Faça sua declaração ou conte um pouco da historia de vocês (momentos marcantes, como se conheceram, apelidos, promessas, superações...)"
            value={story}
            onChange={(e) => setStory(e.target.value)}
            className={`w-full premium-input rounded-2xl text-sm p-5 font-medium resize-none leading-relaxed ${
              errors.story ? 'border-red-500/50 focus:border-red-500' : ''
            }`}
          />
          {errors.story && (
            <span className="text-[10px] text-red-500 mt-2 block font-bold ml-1">{errors.story}</span>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full py-5 px-6 btn-premium-gradient text-white font-bold rounded-2xl text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 mt-8 shadow-xl"
      >
        <span>CRIAR PRÉVIA GRÁTIS</span>
        <Music className="w-5 h-5" />
      </button>

      {/* Disclaimer */}
      <p className="text-[11px] text-premium-text/60 font-medium text-center leading-relaxed pt-3">
        Ao clicar, iremos começar a compor sua prévia exclusiva.
      </p>
    </form>
  );
}
