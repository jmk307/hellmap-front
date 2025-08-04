

interface HellMapLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  variant?: 'default' | 'icon-only' | 'minimal';
}

export function HellMapLogo({ 
  size = 120, 
  className = "", 
  showText = true, 
  variant = 'default' 
}: HellMapLogoProps) {
  const iconSize = variant === 'icon-only' ? size : size * 0.4;
  const textSize = size * 0.15;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Character Triangle Logo */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="hellmap-logo-glow"
      >
        {/* Background Circle with Glow */}
        <circle 
          cx="50" 
          cy="50" 
          r="48" 
          fill="rgba(0,0,0,0.1)"
          stroke="var(--hellmap-neon-green)" 
          strokeWidth="2" 
          opacity="0.3"
          className="hellmap-background-pulse"
        />

        {/* 개무섭 캐릭터 (상단) */}
        <g transform="translate(50, 25)">
          {/* 두개골 */}
          <path
            d="M0 -8C-4 -8 -7 -5 -7 -1v6c0 2 1 3 3 4l1 3h6l1-3c2-1 3-2 3-4v-6c0-4-3-7-7-7z"
            fill="var(--hellmap-fear-color)"
            opacity="0.9"
          />
          {/* 눈구멍 */}
          <ellipse cx="-3" cy="-2" rx="1.5" ry="2" fill="#000" />
          <ellipse cx="3" cy="-2" rx="1.5" ry="2" fill="#000" />
          {/* 코 */}
          <path d="M0 1l-1 2h2l-1-2z" fill="#000" />
          {/* 입 */}
          <path d="M-3 5h6l-1 2h-4l-1-2z" fill="#000" />
          {/* 글로우 효과 */}
          <circle cx="0" cy="0" r="12" fill="var(--hellmap-fear-color)" opacity="0.1">
            <animate 
              attributeName="r" 
              values="10;14;10" 
              dur="3s" 
              repeatCount="indefinite"
            />
          </circle>
        </g>

        {/* 개짜증 캐릭터 (좌하단) */}
        <g transform="translate(30, 65)">
          {/* 화난 얼굴 */}
          <circle cx="0" cy="0" r="10" fill="var(--hellmap-anger-color)" opacity="0.9" />
          {/* 화난 눈썹 */}
          <path d="M-6 -4l4-1v2l-4 1v-2z" fill="#000" />
          <path d="M2 -5l4 1v2l-4-1v-2z" fill="#000" />
          {/* 화난 눈 */}
          <path d="M-5 -1l3-1v2l-3 1v-2z" fill="#000" />
          <path d="M2 -2l3 1v2l-3-1v-2z" fill="#000" />
          {/* 화난 입 */}
          <path d="M-4 4c1 2 3 2 8 0" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* 증기 */}
          <circle cx="-8" cy="-8" r="1" fill="var(--hellmap-anger-color)">
            <animate attributeName="cy" values="-8;-12;-8" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0;0.8" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="8" cy="-7" r="1.2" fill="var(--hellmap-anger-color)">
            <animate attributeName="cy" values="-7;-11;-7" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0;0.8" dur="1.8s" repeatCount="indefinite" />
          </circle>
          {/* 글로우 효과 */}
          <circle cx="0" cy="0" r="12" fill="var(--hellmap-anger-color)" opacity="0.1">
            <animate 
              attributeName="r" 
              values="10;14;10" 
              dur="2.5s" 
              repeatCount="indefinite"
            />
          </circle>
        </g>

        {/* 개웃김 캐릭터 (우하단) */}
        <g transform="translate(70, 65)">
          {/* 웃는 얼굴 */}
          <circle cx="0" cy="0" r="10" fill="var(--hellmap-laugh-color)" opacity="0.9" />
          {/* 웃는 눈 */}
          <path d="M-5 -2c2-2 3-2 5 0" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M0 -2c2-2 3-2 5 0" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* 웃는 입 */}
          <path d="M-5 3c2 4 5 4 10 0" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M-3 4c1 2 3 2 6 0" stroke="#000" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          {/* 웃음 눈물 */}
          <circle cx="-7" cy="-1" r="1" fill="#87CEEB" opacity="0.9">
            <animate attributeName="cy" values="-1;4;-1" dur="2s" repeatCount="indefinite" />
            <animate attributeName="r" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="7" cy="-1" r="1" fill="#87CEEB" opacity="0.9">
            <animate attributeName="cy" values="-1;4;-1" dur="2.2s" repeatCount="indefinite" />
            <animate attributeName="r" values="1;0.5;1" dur="2.2s" repeatCount="indefinite" />
          </circle>
          {/* 글로우 효과 */}
          <circle cx="0" cy="0" r="12" fill="var(--hellmap-laugh-color)" opacity="0.1">
            <animate 
              attributeName="r" 
              values="10;14;10" 
              dur="3.5s" 
              repeatCount="indefinite"
            />
          </circle>
        </g>

        {/* 중앙 연결선 (삼각형) */}
        <g stroke="var(--hellmap-neon-green)" strokeWidth="1" fill="none" opacity="0.4" strokeDasharray="2,2">
          <path d="M50 35 L35 55 L65 55 Z">
            <animate 
              attributeName="stroke-dashoffset" 
              values="0;10;0" 
              dur="4s" 
              repeatCount="indefinite"
            />
          </path>
        </g>

        {/* 중앙 로고 텍스트 (작게) */}
        <text 
          x="50" 
          y="50" 
          textAnchor="middle" 
          dominantBaseline="middle"
          style={{ 
            fontSize: '6px', 
            fontFamily: 'monospace', 
            fontWeight: 'bold',
            fill: 'var(--hellmap-neon-green)',
            opacity: '0.6'
          }}
        >
          HELL
        </text>
      </svg>

      {/* Text Logo */}
      {showText && variant !== 'icon-only' && (
        <div className="flex flex-col">
          <span 
            className="font-bold tracking-wider hellmap-text-glow"
            style={{ 
              fontSize: `${textSize}px`,
              color: 'var(--hellmap-neon-green)',
              fontFamily: 'monospace',
              textShadow: `0 0 10px var(--hellmap-neon-green)`,
              letterSpacing: '0.1em'
            }}
          >
            HELLMAP
          </span>
          {variant === 'default' && (
            <span 
              className="text-xs opacity-80"
              style={{ 
                color: 'var(--hellmap-neon-blue)',
                fontFamily: 'monospace',
                fontSize: `${textSize * 0.5}px`,
                letterSpacing: '0.05em'
              }}
            >
              실시간 감정 지도
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Favicon 전용 심플 버전
export function HellMapFavicon({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background Circle */}
      <circle cx="16" cy="16" r="15" fill="rgba(0,0,0,0.1)" stroke="#00ff88" strokeWidth="1" opacity="0.3" />
      
      {/* 개무섭 (상단) */}
      <g transform="translate(16, 8)">
        <circle cx="0" cy="0" r="3" fill="#ff4444" opacity="0.9" />
        <circle cx="-1" cy="-0.5" rx="0.5" ry="1" fill="#000" />
        <circle cx="1" cy="-0.5" rx="0.5" ry="1" fill="#000" />
        <path d="M-1 1h2l-0.5 1h-1l-0.5-1z" fill="#000" />
      </g>
      
      {/* 개짜증 (좌하단) */}
      <g transform="translate(10, 22)">
        <circle cx="0" cy="0" r="3" fill="#ff8800" opacity="0.9" />
        <path d="M-2 -1l2-0.5v1l-2 0.5v-1z" fill="#000" />
        <path d="M0 -1l2 0.5v1l-2-0.5v-1z" fill="#000" />
        <path d="M-1.5 1c0.5 1 1.5 1 3 0" stroke="#000" strokeWidth="1" fill="none" />
        <circle cx="-2.5" cy="-2" r="0.5" fill="#ff8800" opacity="0.8" />
      </g>
      
      {/* 개웃김 (우하단) */}
      <g transform="translate(22, 22)">
        <circle cx="0" cy="0" r="3" fill="#00ff88" opacity="0.9" />
        <path d="M-1.5 -0.5c1-1 1.5-1 3 0" stroke="#000" strokeWidth="1" fill="none" />
        <path d="M-1.5 1c1 2 2.5 2 3 0" stroke="#000" strokeWidth="1" fill="none" />
        <circle cx="-2" cy="0" r="0.3" fill="#87CEEB" opacity="0.9" />
        <circle cx="2" cy="0" r="0.3" fill="#87CEEB" opacity="0.9" />
      </g>
      
      {/* 삼각형 연결선 */}
      <g stroke="#00ff88" strokeWidth="0.5" fill="none" opacity="0.4">
        <path d="M16 11 L13 19 L19 19 Z" />
      </g>
      
      {/* 중앙 텍스트 */}
      <text 
        x="16" 
        y="16" 
        textAnchor="middle" 
        dominantBaseline="middle"
        style={{ 
          fontSize: '4px', 
          fontFamily: 'monospace', 
          fontWeight: 'bold',
          fill: '#00ff88',
          opacity: '0.6'
        }}
      >
        H
      </text>
    </svg>
  );
}