

interface IconProps {
  size?: number;
  className?: string;
  color?: string;
}

// 개무섭 아이콘 - 더 무서운 두개골과 강렬한 번개
export function FearIcon({ size = 24, className = '', color = '#ff0044' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={`hellmap-icon-fear ${className}`}
      style={{ filter: `drop-shadow(0 0 12px ${color})` }}
    >
      {/* 두개골 */}
      <path
        d="M16 3C11 3 7 6 7 11v7c0 3 1 5 4 6l1 4h8l1-4c3-1 4-3 4-6v-7c0-5-4-8-9-8z"
        fill={color}
        opacity="0.9"
      />
      {/* 더 큰 눈구멍 */}
      <ellipse cx="12" cy="13" rx="2.5" ry="3" fill="#000" />
      <ellipse cx="20" cy="13" rx="2.5" ry="3" fill="#000" />
      {/* 눈 안의 빨간 점 */}
      <circle cx="12" cy="13" r="0.8" fill={color} opacity="0.8">
        <animate
          attributeName="opacity"
          values="0.8;0.3;0.8"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="20" cy="13" r="0.8" fill={color} opacity="0.8">
        <animate
          attributeName="opacity"
          values="0.8;0.3;0.8"
          dur="2.2s"
          repeatCount="indefinite"
        />
      </circle>
      {/* 더 큰 코 구멍 */}
      <path d="M16 16l-2 4h4l-2-4z" fill="#000" />
      {/* 더 무서운 입 */}
      <path d="M11 22h10l-2 3h-6l-2-3z" fill="#000" />
      {/* 더 많은 이빨 */}
      <rect x="12" y="22" width="1" height="3" fill={color} opacity="0.9" />
      <rect x="14" y="22" width="1" height="3" fill={color} opacity="0.9" />
      <rect x="16" y="22" width="1" height="3" fill={color} opacity="0.9" />
      <rect x="18" y="22" width="1" height="3" fill={color} opacity="0.9" />
      <rect x="20" y="22" width="1" height="3" fill={color} opacity="0.9" />
      {/* 더 강렬한 번개들 */}
      <path
        d="M26 6l-4 8h3l-5 10 4-8h-3l5-10z"
        fill={color}
        opacity="0.7"
      >
        <animate
          attributeName="opacity"
          values="0.3;1;0.3"
          dur="1s"
          repeatCount="indefinite"
        />
      </path>
      <path
        d="M6 6l4 8h-3l5 10-4-8h3l-5-10z"
        fill={color}
        opacity="0.5"
      >
        <animate
          attributeName="opacity"
          values="0.2;0.8;0.2"
          dur="1.3s"
          repeatCount="indefinite"
        />
      </path>
      {/* 추가 크랙 효과 */}
      <path d="M16 2l-1 6M20 8l-4 2M12 8l4 2" stroke={color} strokeWidth="1" opacity="0.6" />
    </svg>
  );
}

// 개짜증 아이콘 - 더 화난 얼굴과 강렬한 증기
export function AngerIcon({ size = 24, className = '', color = '#ff6600' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={`hellmap-icon-anger ${className}`}
      style={{ filter: `drop-shadow(0 0 12px ${color})` }}
    >
      {/* 얼굴 */}
      <circle cx="16" cy="16" r="13" fill={color} opacity="0.9" />
      
      {/* 매우 화난 눈썹 */}
      <path d="M8 10l6-1v3l-6 1v-3z" fill="#000" />
      <path d="M24 9l-6 1v3l6-1v-3z" fill="#000" />
      
      {/* 더 작고 화난 눈 */}
      <path d="M10 14l4-1v3l-4 1v-3z" fill="#000" />
      <path d="M18 14l4-1v3l-4 1v-3z" fill="#000" />
      
      {/* 매우 화난 입 */}
      <path d="M10 21c2 4 6 4 12 0" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M12 23h8" stroke="#000" strokeWidth="2" strokeLinecap="round" />
      
      {/* 더 많은 증기 효과들 */}
      <g opacity="0.8">
        <circle cx="6" cy="6" r="1.5" fill={color}>
          <animate
            attributeName="cy"
            values="6;1;6"
            dur="1.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.8;0;0.8"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="9" cy="4" r="2" fill={color}>
          <animate
            attributeName="cy"
            values="4;-1;4"
            dur="1.8s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.8;0;0.8"
            dur="1.8s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="23" cy="4" r="2" fill={color}>
          <animate
            attributeName="cy"
            values="4;-1;4"
            dur="1.6s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.8;0;0.8"
            dur="1.6s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="26" cy="6" r="1.5" fill={color}>
          <animate
            attributeName="cy"
            values="6;1;6"
            dur="1.4s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.8;0;0.8"
            dur="1.4s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="12" cy="3" r="1" fill={color}>
          <animate
            attributeName="cy"
            values="3;-1;3"
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.8;0;0.8"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="20" cy="3" r="1" fill={color}>
          <animate
            attributeName="cy"
            values="3;-1;3"
            dur="1.7s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.8;0;0.8"
            dur="1.7s"
            repeatCount="indefinite"
          />
        </circle>
      </g>
      
      {/* 추가 화난 이펙트 */}
      <path d="M16 29c-2-2-4-4-4-6M16 29c2-2 4-4 4-6" stroke={color} strokeWidth="2" opacity="0.6" strokeLinecap="round" />
    </svg>
  );
}

// 개웃김 아이콘 - 더 과장된 웃는 얼굴과 ㅋㅋㅋ
export function LaughIcon({ size = 24, className = '', color = '#00ff88' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={`hellmap-icon-laugh ${className}`}
      style={{ filter: `drop-shadow(0 0 12px ${color})` }}
    >
      {/* 얼굴 */}
      <circle cx="16" cy="16" r="13" fill={color} opacity="0.9" />
      
      {/* 매우 웃는 눈 */}
      <path d="M8 13c3-3 5-3 8 0" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M16 13c3-3 5-3 8 0" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
      
      {/* 매우 큰 웃는 입 */}
      <path d="M8 20c3 6 8 6 16 0" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M10 22c2 4 6 4 12 0" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" />
      
      {/* 더 많은 눈물 */}
      <circle cx="7" cy="15" r="1.5" fill="#87CEEB" opacity="0.9">
        <animate
          attributeName="cy"
          values="15;22;15"
          dur="1.8s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="r"
          values="1.5;1;1.5"
          dur="1.8s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="25" cy="15" r="1.5" fill="#87CEEB" opacity="0.9">
        <animate
          attributeName="cy"
          values="15;22;15"
          dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="r"
          values="1.5;1;1.5"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
      
      {/* 더 큰 ㅋㅋㅋ 텍스트 */}
      <g fill={color} fontSize="8" fontFamily="Arial, sans-serif" opacity="0.95">
        <text x="28" y="8">ㅋ
          <animate
            attributeName="opacity"
            values="0.5;1;0.5"
            dur="0.8s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="fontSize"
            values="8;10;8"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </text>
        <text x="28" y="16">ㅋ
          <animate
            attributeName="opacity"
            values="0.5;1;0.5"
            dur="0.8s"
            begin="0.2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="fontSize"
            values="8;10;8"
            dur="0.8s"
            begin="0.2s"
            repeatCount="indefinite"
          />
        </text>
        <text x="28" y="24">ㅋ
          <animate
            attributeName="opacity"
            values="0.5;1;0.5"
            dur="0.8s"
            begin="0.4s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="fontSize"
            values="8;10;8"
            dur="0.8s"
            begin="0.4s"
            repeatCount="indefinite"
          />
        </text>
      </g>
      
      {/* 추가 웃음 이펙트 */}
      <g opacity="0.7">
        <text x="2" y="12" fill={color} fontSize="6">ㅋ
          <animate
            attributeName="opacity"
            values="0;0.7;0"
            dur="2s"
            repeatCount="indefinite"
          />
        </text>
        <text x="4" y="8" fill={color} fontSize="5">ㅋ
          <animate
            attributeName="opacity"
            values="0;0.7;0"
            dur="2.2s"
            repeatCount="indefinite"
          />
        </text>
        <text x="2" y="20" fill={color} fontSize="4">ㅋ
          <animate
            attributeName="opacity"
            values="0;0.7;0"
            dur="1.8s"
            repeatCount="indefinite"
          />
        </text>
      </g>
    </svg>
  );
}

// 전체/불꽃 아이콘 (변경 없음)
export function FireIcon({ size = 24, className = '', color = '#00ccff' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={`hellmap-icon-fire ${className}`}
      style={{ filter: `drop-shadow(0 0 8px ${color})` }}
    >
      {/* 외부 불꽃 */}
      <path
        d="M16 4c-2 0-4 2-6 6-2 4-2 8 0 12 1 2 3 4 6 4s5-2 6-4c2-4 2-8 0-12-2-4-4-6-6-6z"
        fill={color}
        opacity="0.6"
      >
        <animate
          attributeName="opacity"
          values="0.4;0.8;0.4"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </path>
      
      {/* 내부 불꽃 */}
      <path
        d="M16 8c-1 0-2 1-3 3-1 2-1 4 0 6 0.5 1 1.5 2 3 2s2.5-1 3-2c1-2 1-4 0-6-1-2-2-3-3-3z"
        fill="#ffffff"
        opacity="0.8"
      >
        <animate
          attributeName="opacity"
          values="0.6;1;0.6"
          dur="1s"
          repeatCount="indefinite"
        />
      </path>
      
      {/* 불꽃 입자들 */}
      <g opacity="0.7">
        <circle cx="12" cy="12" r="1" fill={color}>
          <animate
            attributeName="cy"
            values="12;8;12"
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.7;0;0.7"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="20" cy="14" r="0.8" fill={color}>
          <animate
            attributeName="cy"
            values="14;10;14"
            dur="1.8s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.7;0;0.7"
            dur="1.8s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="16" cy="6" r="0.5" fill={color}>
          <animate
            attributeName="cy"
            values="6;2;6"
            dur="2.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.7;0;0.7"
            dur="2.5s"
            repeatCount="indefinite"
          />
        </circle>
      </g>
    </svg>
  );
}