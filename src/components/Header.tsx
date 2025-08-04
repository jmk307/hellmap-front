
import { Button } from './ui/button';
import { FireIcon, FearIcon, AngerIcon, LaughIcon } from './icons/EmotionIcons';
import { HellMapLogo } from './icons/HellMapLogo';

interface HeaderProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  onLogout?: () => void;
  onCreateReport?: () => void;
  onServiceIntro?: () => void;
  onFeedback?: () => void;  // 피드백 핸들러 추가
  userNickname?: string;
  reportsCount?: number;  // 실제 제보 수 추가
}

export function Header({ activeFilter, onFilterChange, onLogout, onCreateReport, onServiceIntro, onFeedback, userNickname, reportsCount = 0 }: HeaderProps) {
  const filters = [
    { 
      id: 'all', 
      label: '전체', 
      icon: FireIcon, 
      color: 'var(--hellmap-neon-blue)' 
    },
    { 
      id: 'SCARY', 
      label: '개무섭', 
      icon: FearIcon, 
      color: 'var(--hellmap-fear-color)' 
    },
    { 
      id: 'ANNOYING', 
      label: '개짜증', 
      icon: AngerIcon, 
      color: 'var(--hellmap-anger-color)' 
    },
    { 
      id: 'FUNNY', 
      label: '개웃김', 
      icon: LaughIcon, 
      color: 'var(--hellmap-laugh-color)' 
    }
  ];

  return (
    <header 
      className="sticky top-0 z-50 border-b"
      style={{ 
        backgroundColor: 'var(--hellmap-darker-bg)',
        borderColor: 'var(--hellmap-border)'
      }}
    >
      {/* Mobile Layout */}
      <div className="block lg:hidden">
        {/* Top Row - Logo and User Menu */}
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <HellMapLogo size={100} variant="minimal" />
            {/* Beta Badge */}
            <div 
              className="px-2 py-1 rounded-full text-xs font-medium animate-pulse"
              style={{ 
                backgroundColor: 'var(--hellmap-neon-orange)',
                color: 'black',
                boxShadow: '0 0 10px var(--hellmap-neon-orange)'
              }}
            >
              BETA
            </div>
          </div>
          
          {/* Mobile Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Service Intro Button */}
            {onServiceIntro && (
              <Button
                onClick={onServiceIntro}
                className="px-2 py-1 rounded-lg border transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: 'var(--hellmap-card-bg)',
                  borderColor: 'var(--hellmap-neon-blue)',
                  color: 'var(--hellmap-neon-blue)'
                }}
              >
                <span className="text-xs">ℹ️ 소개</span>
              </Button>
            )}

            {/* Create Report Button */}
            {onCreateReport && (
              <Button
                onClick={onCreateReport}
                className="px-2 py-1 rounded-lg border transition-all duration-300 hover:scale-105 hellmap-neon-glow"
                style={{
                  backgroundColor: 'var(--hellmap-neon-green)',
                  borderColor: 'var(--hellmap-neon-green)',
                  color: 'black'
                }}
              >
                <span className="text-xs">✏️ 제보</span>
              </Button>
            )}

            {/* Feedback Button */}
            {onFeedback && (
              <Button
                onClick={onFeedback}
                className="px-2 py-1 rounded-lg border transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: 'var(--hellmap-card-bg)',
                  borderColor: 'var(--hellmap-neon-orange)',
                  color: 'var(--hellmap-neon-orange)'
                }}
              >
                <span className="text-xs">💬 피드백</span>
              </Button>
            )}
            
            <div className="flex items-center gap-2 text-xs">
              <div style={{ color: 'var(--hellmap-text-secondary)' }}>
                <span style={{ color: 'var(--hellmap-neon-green)' }}>{reportsCount.toLocaleString()}</span>
              </div>
              <div 
                className="px-2 py-1 rounded-full animate-pulse"
                style={{ 
                  backgroundColor: 'var(--hellmap-fear-color)', 
                  color: 'white' 
                }}
              >
                LIVE
              </div>
            </div>
            
            {/* User Info & Logout */}
            {userNickname && (
              <div className="flex items-center gap-1">
                <div 
                  className="px-2 py-1 rounded-lg border text-xs"
                  style={{
                    backgroundColor: 'var(--hellmap-card-bg)',
                    borderColor: 'var(--hellmap-border)',
                    color: 'var(--hellmap-neon-green)'
                  }}
                >
                  {userNickname}
                </div>
                {onLogout && (
                  <Button
                    onClick={onLogout}
                    className="px-2 py-1 rounded-lg border transition-all duration-300 hover:scale-105"
                    style={{
                      backgroundColor: 'var(--hellmap-card-bg)',
                      borderColor: 'var(--hellmap-border-bright)',
                      color: 'var(--hellmap-text-secondary)'
                    }}
                  >
                    <span className="text-xs">나가기</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Bottom Row - Filter Buttons */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            {filters.map((filter) => {
              const IconComponent = filter.icon;
              return (
                <Button
                  key={filter.id}
                  onClick={() => onFilterChange(filter.id)}
                  className={`px-3 py-2 rounded-lg border transition-all duration-300 whitespace-nowrap ${
                    activeFilter === filter.id 
                      ? 'hellmap-neon-glow scale-105' 
                      : 'hover:scale-105'
                  }`}
                  style={{
                    backgroundColor: activeFilter === filter.id 
                      ? `${filter.color}20` 
                      : 'var(--hellmap-card-bg)',
                    borderColor: filter.color,
                    color: activeFilter === filter.id 
                      ? filter.color 
                      : 'var(--hellmap-text-secondary)'
                  }}
                >
                  <div className="mr-2">
                    <IconComponent size={16} />
                  </div>
                  <span className="text-sm">{filter.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <HellMapLogo size={140} variant="default" />
            {/* Beta Badge */}
            <div 
              className="px-3 py-1 rounded-full text-sm font-medium animate-pulse"
              style={{ 
                backgroundColor: 'var(--hellmap-neon-orange)',
                color: 'black',
                boxShadow: '0 0 15px var(--hellmap-neon-orange)'
              }}
            >
              BETA
            </div>
          </div>

          {/* Navigation Filters */}
          <div className="flex items-center gap-2">
            {filters.map((filter) => {
              const IconComponent = filter.icon;
              return (
                <Button
                  key={filter.id}
                  onClick={() => onFilterChange(filter.id)}
                  className={`px-4 py-2 rounded-lg border transition-all duration-300 ${
                    activeFilter === filter.id 
                      ? 'hellmap-neon-glow scale-105' 
                      : 'hover:scale-105'
                  }`}
                  style={{
                    backgroundColor: activeFilter === filter.id 
                      ? `${filter.color}20` 
                      : 'var(--hellmap-card-bg)',
                    borderColor: filter.color,
                    color: activeFilter === filter.id 
                      ? filter.color 
                      : 'var(--hellmap-text-secondary)'
                  }}
                >
                  <div className="mr-2">
                    <IconComponent size={20} />
                  </div>
                  <span>{filter.label}</span>
                </Button>
              );
            })}
          </div>

          {/* Action Buttons and User Menu */}
          <div className="flex items-center gap-4">
            {/* Service Intro Button */}
            {onServiceIntro && (
              <Button
                onClick={onServiceIntro}
                className="px-4 py-2 rounded-lg border-2 transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: 'var(--hellmap-card-bg)',
                  borderColor: 'var(--hellmap-neon-blue)',
                  color: 'var(--hellmap-neon-blue)'
                }}
              >
                <div className="flex items-center gap-2">
                  <span>ℹ️</span>
                  <span>서비스 소개</span>
                </div>
              </Button>
            )}

            {/* Create Report Button */}
            {onCreateReport && (
              <Button
                onClick={onCreateReport}
                className="px-4 py-2 rounded-lg border-2 transition-all duration-300 hover:scale-105 hellmap-neon-glow"
                style={{
                  backgroundColor: 'var(--hellmap-neon-green)',
                  borderColor: 'var(--hellmap-neon-green)',
                  color: 'black'
                }}
              >
                <div className="flex items-center gap-2">
                  <span>✏️</span>
                  <span>제보하기</span>
                </div>
              </Button>
            )}

            {/* Feedback Button */}
            {onFeedback && (
              <Button
                onClick={onFeedback}
                className="px-4 py-2 rounded-lg border-2 transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: 'var(--hellmap-card-bg)',
                  borderColor: 'var(--hellmap-neon-orange)',
                  color: 'var(--hellmap-neon-orange)'
                }}
              >
                <div className="flex items-center gap-2">
                  <span>💬</span>
                  <span>피드백</span>
                </div>
              </Button>
            )}

            <div className="flex items-center gap-6 text-sm">
              <div style={{ color: 'var(--hellmap-text-secondary)' }}>
                <span style={{ color: 'var(--hellmap-neon-green)' }}>{reportsCount.toLocaleString()}</span> 활성 제보
              </div>
            </div>
            
            {/* User Info & Logout */}
            {userNickname && (
              <div className="flex items-center gap-3">
                <div 
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--hellmap-card-bg)',
                    borderColor: 'var(--hellmap-border)',
                    color: 'var(--hellmap-text-primary)'
                  }}
                >
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: 'var(--hellmap-neon-green)' }}
                  />
                  <span style={{ color: 'var(--hellmap-neon-green)' }}>
                    {userNickname}
                  </span>
                </div>
                
                {onLogout && (
                  <Button
                    onClick={onLogout}
                    className="px-4 py-2 rounded-lg border transition-all duration-300 hover:scale-105"
                    style={{
                      backgroundColor: 'var(--hellmap-card-bg)',
                      borderColor: 'var(--hellmap-border-bright)',
                      color: 'var(--hellmap-text-secondary)'
                    }}
                  >
                    <span>로그아웃</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}