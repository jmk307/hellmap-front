import { useState } from 'react';
import { EmotionCharacter } from '../HellMapCharacters';
import { Emotion } from '../../../types/report';

interface ImageWithFallbackProps {
  src?: string;
  alt: string;
  className?: string;
  emotion?: Emotion;
}

export function ImageWithFallback({ 
  src, 
  alt, 
  className = '', 
  emotion = 'SCARY'
}: ImageWithFallbackProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // src가 없거나 비어있거나 imageError가 발생한 경우 캐릭터 표시
  const shouldShowFallback = !src || src.trim() === '' || imageError;

  if (shouldShowFallback) {
    return (
      <div 
        className={`w-full h-48 flex flex-col rounded-lg border-2 relative overflow-hidden ${className}`}
        style={{
          backgroundColor: 'var(--hellmap-darker-bg)',
          borderColor: emotion === 'SCARY' ? 'var(--hellmap-fear-color)' : 
                      emotion === 'ANNOYING' ? 'var(--hellmap-anger-color)' : 
                      'var(--hellmap-laugh-color)'
        }}
      >
        {/* 캐릭터 영역 - 상단 75% */}
        <div className="flex-1 flex items-end justify-center pb-1.5" style={{ flex: '0 0 75%' }}>
          <EmotionCharacter
            emotion={emotion === 'SCARY' ? 'fear' : emotion === 'ANNOYING' ? 'anger' : 'laugh'}
            size={60}
            animated={true}
            characterEmotion="active"
            ultraBright={true}
          />
        </div>
        
        {/* 텍스트 영역 - 하단 25% */}
        <div className="flex flex-col justify-end items-center px-3 pb-2" style={{ flex: '0 0 25%' }}>
          <p 
            className="text-base font-medium text-center leading-tight"
            style={{ 
              color: emotion === 'SCARY' ? 'var(--hellmap-fear-color)' : 
                     emotion === 'ANNOYING' ? 'var(--hellmap-anger-color)' : 
                     'var(--hellmap-laugh-color)'
            }}
          >
            {emotion === 'SCARY' ? '오싹한 실화 👻' :
             emotion === 'ANNOYING' ? '빡치는 현실 💢' :
             '빵터지는 순간 😂'}
          </p>
        </div>

        {/* 장식 효과 */}
        <div className="absolute top-2 left-2">
          <div 
            className="px-2 py-1 rounded-full text-xs font-bold"
            style={{
              backgroundColor: emotion === 'SCARY' ? 'var(--hellmap-fear-color)' : 
                              emotion === 'ANNOYING' ? 'var(--hellmap-anger-color)' : 
                              'var(--hellmap-laugh-color)',
              color: 'black'
            }}
          >
            {emotion === 'SCARY' ? '개무섭' :
             emotion === 'ANNOYING' ? '개짜증' :
             '개웃김'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {!imageLoaded && (
        <div 
          className="absolute inset-0 flex items-center justify-center rounded-lg"
          style={{ backgroundColor: 'var(--hellmap-darker-bg)' }}
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--hellmap-neon-blue)' }}></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover rounded-lg transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
      />
    </div>
  );
}
