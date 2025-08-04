
import { Button } from './ui/button';
import { Card } from './ui/card';
import { FireIcon, FearIcon, AngerIcon, LaughIcon } from './icons/EmotionIcons';

interface ServiceIntroProps {
  onClose: () => void;
  onGetStarted: () => void;
  reportsCount?: number;  // 실제 제보 수 추가
}

export function ServiceIntro({ onClose, onGetStarted, reportsCount = 0 }: ServiceIntroProps) {
  const features = [
    {
      icon: '🗺️',
      title: 'AI 감정 지도',
      description: '인공지능이 분석한 서울 각 지역의 실시간 감정 상태를 한눈에 확인하세요',
      color: 'var(--hellmap-neon-blue)'
    },
    {
      icon: '📱',
      title: '실시간 제보',
      description: '개무섭, 개짜증, 개웃김 상황을 실시간으로 제보하고 공유하세요',
      color: 'var(--hellmap-neon-green)'
    },
    {
      icon: '🔥',
      title: '지옥도 측정',
      description: '지역별 스트레스 지수를 1-5단계로 측정하여 위험도를 알려드려요',
      color: 'var(--hellmap-fear-color)'
    },
    {
      icon: '🤖',
      title: 'AI 이미지 생성',
      description: '각 지역에서 가장 많은 좋아요를 받은 제보 3개를 요약하여 AI가 지역별 특성 이미지를 생성합니다',
      color: 'var(--hellmap-anger-color)'
    }
  ];

  const emotions = [
    {
      icon: FearIcon,
      label: '개무섭',
      description: '위험하거나 무서운 상황',
      color: 'var(--hellmap-fear-color)',
      examples: ['새벽 골목길', '이상한 소리', '무서운 사람']
    },
    {
      icon: AngerIcon,
      label: '개짜증',
      description: '짜증나고 스트레스받는 상황',
      color: 'var(--hellmap-anger-color)',
      examples: ['교통체증', '진상 손님', '시끄러운 소음']
    },
    {
      icon: LaughIcon,
      label: '개웃김',
      description: '재미있고 웃긴 상황',
      color: 'var(--hellmap-laugh-color)',
      examples: ['재미있는 사건', '웃긴 상황', '유머러스한 일']
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ 
        background: 'radial-gradient(circle at center, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.98) 100%)',
        backdropFilter: 'blur(10px)'
      }}
    >
      <div className="min-h-screen p-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <FireIcon size={40} />
            <h1 
              className="text-3xl lg:text-4xl font-bold hellmap-neon-text-shadow"
              style={{ color: 'var(--hellmap-neon-green)' }}
            >
              HELLMAP
            </h1>
            <div className="flex items-center gap-2">
              <div 
                className="text-sm px-3 py-1 rounded-full border"
                style={{ 
                  backgroundColor: 'var(--hellmap-card-bg)',
                  borderColor: 'var(--hellmap-neon-green)',
                  color: 'var(--hellmap-neon-green)'
                }}
              >
                AI POWERED
              </div>
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
          </div>
          
          <Button
            onClick={onClose}
            className="w-12 h-12 rounded-full border-2 hover:scale-110 transition-transform"
            style={{
              backgroundColor: 'var(--hellmap-card-bg)',
              borderColor: 'var(--hellmap-border)',
              color: 'var(--hellmap-text-secondary)'
            }}
          >
            ✕
          </Button>
        </div>

        <div className="max-w-6xl mx-auto w-full">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h2 
              className="text-4xl lg:text-6xl font-bold mb-6"
              style={{ 
                background: 'linear-gradient(45deg, var(--hellmap-neon-green), var(--hellmap-neon-blue))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              감정으로 그려지는<br />서울의 실시간 지도
            </h2>
            <p 
              className="text-xl lg:text-2xl mb-8 leading-relaxed"
              style={{ color: 'var(--hellmap-text-secondary)' }}
            >
              AI가 분석하는 서울 각 지역의 실시간 감정 상태를 확인하고,<br />
              나만의 감정 제보로 다른 사람들에게 도움을 주세요.
            </p>
            
            {/* Beta Notice */}
            <div 
              className="inline-block px-6 py-4 rounded-xl border-2 mb-8"
              style={{
                backgroundColor: 'var(--hellmap-card-bg)',
                borderColor: 'var(--hellmap-neon-orange)',
                boxShadow: '0 0 20px var(--hellmap-neon-orange)20'
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div 
                  className="px-2 py-1 rounded-full text-xs font-medium animate-pulse"
                  style={{ 
                    backgroundColor: 'var(--hellmap-neon-orange)',
                    color: 'black'
                  }}
                >
                  BETA
                </div>
                <span 
                  className="text-lg font-bold"
                  style={{ color: 'var(--hellmap-neon-orange)' }}
                >
                  베타 서비스 안내
                </span>
              </div>
              <p 
                className="text-base leading-relaxed"
                style={{ color: 'var(--hellmap-text-secondary)' }}
              >
                현재 베타 버전으로 <span style={{ color: 'var(--hellmap-neon-blue)' }}>서울 지역</span>만 서비스되고 있으며,<br />
                제보 데이터는 <span style={{ color: 'var(--hellmap-neon-green)' }}>가상의 데이터</span>로 구성되어 있습니다.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={onGetStarted}
                className="px-8 py-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 hellmap-neon-glow text-lg"
                style={{
                  backgroundColor: 'var(--hellmap-neon-green)',
                  borderColor: 'var(--hellmap-neon-green)',
                  color: 'black'
                }}
              >
                🚀 지금 시작하기
              </Button>
              
              <div 
                className="px-6 py-3 rounded-xl border text-sm"
                style={{
                  backgroundColor: 'var(--hellmap-card-bg)',
                  borderColor: 'var(--hellmap-border)',
                  color: 'var(--hellmap-text-secondary)'
                }}
              >
                📊 현재 <span style={{ color: 'var(--hellmap-neon-blue)' }}>{reportsCount.toLocaleString()}개</span> 활성 제보
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="mb-16">
            <h3 
              className="text-2xl lg:text-3xl font-bold text-center mb-12"
              style={{ color: 'var(--hellmap-text-primary)' }}
            >
              🌟 주요 기능
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="p-6 border-2 hover:scale-105 transition-all duration-300"
                  style={{
                    backgroundColor: 'var(--hellmap-card-bg)',
                    borderColor: feature.color,
                    boxShadow: `0 0 20px ${feature.color}20`
                  }}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h4 
                      className="text-lg font-bold mb-3"
                      style={{ color: feature.color }}
                    >
                      {feature.title}
                    </h4>
                    <p 
                      className="text-sm leading-relaxed"
                      style={{ color: 'var(--hellmap-text-secondary)' }}
                    >
                      {feature.description}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Emotions Section */}
          <div className="mb-16">
            <h3 
              className="text-2xl lg:text-3xl font-bold text-center mb-12"
              style={{ color: 'var(--hellmap-text-primary)' }}
            >
              😄 감정 분류 시스템
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {emotions.map((emotion, index) => {
                const IconComponent = emotion.icon;
                return (
                  <Card
                    key={index}
                    className="p-8 border-2 hover:scale-105 transition-all duration-300"
                    style={{
                      backgroundColor: 'var(--hellmap-card-bg)',
                      borderColor: emotion.color,
                      boxShadow: `0 0 30px ${emotion.color}20`
                    }}
                  >
                    <div className="text-center">
                      <div className="flex justify-center mb-4">
                        <IconComponent size={48} />
                      </div>
                      <h4 
                        className="text-2xl font-bold mb-3"
                        style={{ color: emotion.color }}
                      >
                        {emotion.label}
                      </h4>
                      <p 
                        className="text-base mb-6"
                        style={{ color: 'var(--hellmap-text-secondary)' }}
                      >
                        {emotion.description}
                      </p>
                      
                      <div className="space-y-2">
                        <p 
                          className="text-sm font-medium"
                          style={{ color: 'var(--hellmap-text-primary)' }}
                        >
                          예시 상황:
                        </p>
                        {emotion.examples.map((example, idx) => (
                          <div
                            key={idx}
                            className="text-xs px-3 py-1 rounded-full"
                            style={{
                              backgroundColor: `${emotion.color}15`,
                              color: emotion.color,
                              border: `1px solid ${emotion.color}40`
                            }}
                          >
                            {example}
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* How to Use Section */}
          <div className="mb-16">
            <h3 
              className="text-2xl lg:text-3xl font-bold text-center mb-12"
              style={{ color: 'var(--hellmap-text-primary)' }}
            >
              🎯 사용법
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"
                  style={{ 
                    backgroundColor: 'var(--hellmap-neon-green)',
                    color: 'black'
                  }}
                >
                  1
                </div>
                <h4 
                  className="text-xl font-bold mb-3"
                  style={{ color: 'var(--hellmap-neon-green)' }}
                >
                  소셜 로그인
                </h4>
                <p style={{ color: 'var(--hellmap-text-secondary)' }}>
                  구글 또는 카카오로 간편하게 로그인하고 닉네임을 설정하세요.
                </p>
              </div>
              
              <div className="text-center">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"
                  style={{ 
                    backgroundColor: 'var(--hellmap-neon-blue)',
                    color: 'black'
                  }}
                >
                  2
                </div>
                <h4 
                  className="text-xl font-bold mb-3"
                  style={{ color: 'var(--hellmap-neon-blue)' }}
                >
                  지도 탐색
                </h4>
                <p style={{ color: 'var(--hellmap-text-secondary)' }}>
                  서울 각 지역의 실시간 감정 상태를 확인하고 AI 이미지를 감상하세요.
                </p>
              </div>
              
              <div className="text-center">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"
                  style={{ 
                    backgroundColor: 'var(--hellmap-anger-color)',
                    color: 'white'
                  }}
                >
                  3
                </div>
                <h4 
                  className="text-xl font-bold mb-3"
                  style={{ color: 'var(--hellmap-anger-color)' }}
                >
                  감정 제보
                </h4>
                <p style={{ color: 'var(--hellmap-text-secondary)' }}>
                  현재 상황의 감정을 제보하고 다른 사람들과 공유하세요.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div 
            className="text-center p-12 rounded-2xl border-2"
            style={{
              backgroundColor: 'var(--hellmap-card-bg)',
              borderColor: 'var(--hellmap-neon-green)',
              boxShadow: '0 0 40px rgba(0, 255, 136, 0.1)'
            }}
          >
            <h3 
              className="text-3xl font-bold mb-4"
              style={{ color: 'var(--hellmap-neon-green)' }}
            >
              지금 바로 헬맵을 시작해보세요! 🔥
            </h3>
            <p 
              className="text-lg mb-8"
              style={{ color: 'var(--hellmap-text-secondary)' }}
            >
              AI가 분석하는 서울의 실시간 감정 지도와 함께<br />
              새로운 도시 탐험을 경험해보세요.
            </p>
            <p 
              className="text-sm mb-8"
              style={{ color: 'var(--hellmap-text-muted)' }}
            >
              ⚠️ 베타 서비스: 서울 지역만 지원, 가상 데이터로 구성
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Button
                onClick={onGetStarted}
                className="px-12 py-4 rounded-xl border-2 transition-all duration-300 hover:scale-110 hellmap-neon-glow text-xl"
                style={{
                  backgroundColor: 'var(--hellmap-neon-green)',
                  borderColor: 'var(--hellmap-neon-green)',
                  color: 'black'
                }}
              >
                🚀 헬맵 시작하기
              </Button>
            </div>

            {/* Feedback Section */}
            <div 
              className="p-6 rounded-xl border-2"
              style={{
                backgroundColor: 'var(--hellmap-darker-bg)',
                borderColor: 'var(--hellmap-neon-purple)',
                boxShadow: '0 0 20px rgba(255, 0, 255, 0.1)'
              }}
            >
              <div className="flex items-center justify-center gap-3 mb-3">
                <div 
                  className="text-2xl"
                  style={{ color: 'var(--hellmap-neon-purple)' }}
                >
                  💬
                </div>
                <h4 
                  className="text-lg font-bold"
                  style={{ color: 'var(--hellmap-neon-purple)' }}
                >
                  피드백 보내기
                </h4>
              </div>
              <p 
                className="text-sm leading-relaxed mb-4"
                style={{ color: 'var(--hellmap-text-secondary)' }}
              >
                버그를 발견하셨나요? 수정하고 싶은 기능이 있나요?<br />
                새로운 기능을 제안하고 싶으시다면 피드백을 보내주세요!
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-xs">
                <span 
                  className="px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: 'rgba(255, 0, 255, 0.1)',
                    borderColor: 'var(--hellmap-neon-purple)',
                    border: '1px solid',
                    color: 'var(--hellmap-neon-purple)'
                  }}
                >
                  🐛 버그 리포트
                </span>
                <span 
                  className="px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: 'rgba(255, 0, 255, 0.1)',
                    borderColor: 'var(--hellmap-neon-purple)',
                    border: '1px solid',
                    color: 'var(--hellmap-neon-purple)'
                  }}
                >
                  ✨ 기능 제안
                </span>
                <span 
                  className="px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: 'rgba(255, 0, 255, 0.1)',
                    borderColor: 'var(--hellmap-neon-purple)',
                    border: '1px solid',
                    color: 'var(--hellmap-neon-purple)'
                  }}
                >
                  🔧 개선 사항
                </span>
                <span 
                  className="px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: 'rgba(255, 0, 255, 0.1)',
                    borderColor: 'var(--hellmap-neon-purple)',
                    border: '1px solid',
                    color: 'var(--hellmap-neon-purple)'
                  }}
                >
                  💭 기타 의견
                </span>
              </div>
              <p 
                className="text-xs mt-3"
                style={{ color: 'var(--hellmap-text-muted)' }}
              >
                메인 화면에서 💬 피드백 버튼을 클릭하시면 피드백을 보낼 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}