

type EmotionType = 'fear' | 'anger' | 'laugh';
type CharacterEmotionType = 'idle' | 'active' | 'hover';
type SizeType = 'sm' | 'md' | 'lg' | number;

interface EmotionCharacterProps {
  emotion: EmotionType;
  characterEmotion?: CharacterEmotionType;
  size?: number;
  animated?: boolean;
  className?: string;
  ultraBright?: boolean;
}

interface CharacterAvatarProps {
  emotion: EmotionType;
  size?: SizeType;
  interactive?: boolean;
  showName?: boolean;
  aiMode?: boolean;
  variant?: 'default' | 'header';
  ultraBright?: boolean;
}

const getSizeValue = (size: SizeType): number => {
  if (typeof size === 'number') return size;
  switch (size) {
    case 'sm': return 24;
    case 'md': return 48;
    case 'lg': return 64;
    default: return 48;
  }
};

export function EmotionCharacter({
  emotion,
  characterEmotion = 'idle',
  size = 48,
  animated = false,
  className = '',
  ultraBright = false
}: EmotionCharacterProps) {
  const getCharacterColor = () => {
    switch (emotion) {
      case 'fear': return 'var(--hellmap-fear-color)';
      case 'anger': return 'var(--hellmap-anger-color)';
      case 'laugh': return 'var(--hellmap-laugh-color)';
      default: return 'var(--hellmap-neon-blue)';
    }
  };

  const getGlowIntensity = () => {
    if (ultraBright) return '0 0 30px currentColor, 0 0 60px currentColor';
    switch (characterEmotion) {
      case 'active': return '0 0 20px currentColor';
      case 'hover': return '0 0 15px currentColor';
      default: return '0 0 10px currentColor';
    }
  };

  const renderCharacter = () => {
    const color = getCharacterColor();
    
    switch (emotion) {
      case 'fear':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
            <defs>
              <filter id={`glow-fear-${size}`}>
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {/* 무서워하는 캐릭터 */}
            <circle 
              cx="50" cy="45" r="30" 
              fill={color} 
              opacity="0.8"
              filter={`url(#glow-fear-${size})`}
              style={{ filter: `drop-shadow(${getGlowIntensity()})` }}
            />
            {/* 떨고 있는 눈 */}
            <circle cx="42" cy="38" r="3" fill="white" />
            <circle cx="58" cy="38" r="3" fill="white" />
            <circle cx="42" cy="38" r="1.5" fill="black" />
            <circle cx="58" cy="38" r="1.5" fill="black" />
            {/* 떨리는 입 */}
            <path 
              d="M 45 55 Q 50 60 55 55" 
              stroke="white" 
              strokeWidth="2" 
              fill="none"
              className={animated ? 'animate-pulse' : ''}
            />
            {/* 떨림 표현 */}
            <path d="M 30 25 L 28 20 M 70 25 L 72 20" stroke={color} strokeWidth="2" opacity="0.7" />
          </svg>
        );

      case 'anger':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
            <defs>
              <filter id={`glow-anger-${size}`}>
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {/* 화난 캐릭터 */}
            <circle 
              cx="50" cy="45" r="30" 
              fill={color} 
              opacity="0.8"
              filter={`url(#glow-anger-${size})`}
              style={{ filter: `drop-shadow(${getGlowIntensity()})` }}
            />
            {/* 화난 눈썹 */}
            <path d="M 35 32 L 45 36" stroke="white" strokeWidth="3" />
            <path d="M 65 32 L 55 36" stroke="white" strokeWidth="3" />
            {/* 화난 눈 */}
            <circle cx="42" cy="38" r="2" fill="white" />
            <circle cx="58" cy="38" r="2" fill="white" />
            {/* 화난 입 */}
            <path 
              d="M 45 58 Q 50 55 55 58" 
              stroke="white" 
              strokeWidth="3" 
              fill="none"
            />
            {/* 화염 표현 */}
            <path d="M 30 20 Q 35 15 30 10 M 70 20 Q 65 15 70 10" stroke={color} strokeWidth="2" opacity="0.8" />
          </svg>
        );

      case 'laugh':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
            <defs>
              <filter id={`glow-laugh-${size}`}>
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {/* 웃는 캐릭터 */}
            <circle 
              cx="50" cy="45" r="30" 
              fill={color} 
              opacity="0.8"
              filter={`url(#glow-laugh-${size})`}
              style={{ filter: `drop-shadow(${getGlowIntensity()})` }}
            />
            {/* 웃는 눈 */}
            <path d="M 37 35 Q 42 40 47 35" stroke="white" strokeWidth="3" fill="none" />
            <path d="M 53 35 Q 58 40 63 35" stroke="white" strokeWidth="3" fill="none" />
            {/* 웃는 입 */}
            <path 
              d="M 40 55 Q 50 65 60 55" 
              stroke="white" 
              strokeWidth="3" 
              fill="none"
              className={animated ? 'animate-bounce' : ''}
            />
            {/* 웃음 표현 */}
            <text x="25" y="25" fill={color} fontSize="12" opacity="0.8">ㅋ</text>
            <text x="75" y="25" fill={color} fontSize="12" opacity="0.8">ㅋ</text>
          </svg>
        );

      default:
        return null;
    }
  };

  return renderCharacter();
}

export function CharacterAvatar({
  emotion,
  size = 'md',
  interactive = false,
  showName = true,

  variant = 'default',
  ultraBright = false
}: CharacterAvatarProps) {
  const sizeValue = getSizeValue(size);
  
  const getCharacterName = () => {
    switch (emotion) {
      case 'fear': return '무서미';
      case 'anger': return '화나미';
      case 'laugh': return '웃기미';
      default: return '';
    }
  };

  return (
    <div className={`flex flex-col items-center gap-1 ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}>
      <div 
        className={`p-1 rounded-full ${variant === 'header' ? 'border-2' : 'border'}`}
        style={{
          backgroundColor: 'var(--hellmap-card-bg)',
          borderColor: ultraBright ? 'currentColor' : 'var(--hellmap-border)',
          filter: ultraBright ? 'brightness(1.5)' : 'none'
        }}
      >
        <EmotionCharacter
          emotion={emotion}
          size={sizeValue}
          animated={interactive}
          ultraBright={ultraBright}
        />
      </div>
      {showName && (
        <span 
          className="text-xs"
          style={{ color: 'var(--hellmap-text-secondary)' }}
        >
          {getCharacterName()}
        </span>
      )}
    </div>
  );
} 