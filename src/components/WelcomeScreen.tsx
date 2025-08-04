import { useEffect, useState } from 'react';
import { FireIcon, FearIcon, AngerIcon, LaughIcon } from './icons/EmotionIcons';

interface WelcomeScreenProps {
  nickname: string;
  onComplete: () => void;
}

export function WelcomeScreen({ nickname, onComplete }: WelcomeScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showFireworks, setShowFireworks] = useState(false);

  const steps = [
    {
      icon: FireIcon,
      color: 'var(--hellmap-neon-blue)',
      title: `어서오세요, ${nickname}님!`,
      subtitle: 'HellMap에 오신 것을 환영합니다',
      delay: 1000
    },
    {
      icon: FearIcon,
      color: 'var(--hellmap-fear-color)',
      title: '개무서운 순간들을',
      subtitle: '함께 공유해보세요',
      delay: 1500
    },
    {
      icon: AngerIcon,
      color: 'var(--hellmap-anger-color)',
      title: '개짜증나는 일들을',
      subtitle: '털어놓고 시원해지세요',
      delay: 1500
    },
    {
      icon: LaughIcon,
      color: 'var(--hellmap-laugh-color)',
      title: '개웃긴 이야기들로',
      subtitle: '모두와 함께 웃어보세요',
      delay: 1500
    },
    {
      icon: FireIcon,
      color: 'var(--hellmap-neon-green)',
      title: '지옥 같은 하루도',
      subtitle: '혼자가 아니에요!',
      delay: 2000
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setShowFireworks(true);
        setTimeout(() => {
          onComplete();
        }, 2000);
      }
    }, steps[currentStep].delay);

    return () => clearTimeout(timer);
  }, [currentStep, onComplete]);

  const currentStepData = steps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ 
        backgroundColor: 'var(--hellmap-dark-bg)',
        backgroundImage: `
          radial-gradient(circle at 50% 50%, ${currentStepData.color}20 0%, transparent 50%)
        `
      }}
    >
      {/* Animated Background Grid */}
      <div 
        className="absolute inset-0 opacity-20 transition-opacity duration-1000"
        style={{
          backgroundImage: `
            linear-gradient(${currentStepData.color}40 1px, transparent 1px),
            linear-gradient(90deg, ${currentStepData.color}40 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          animation: 'hellmapGridFloat 3s ease-in-out infinite'
        }}
      />

      {/* Fireworks Effect */}
      {showFireworks && (
        <>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-ping"
              style={{
                backgroundColor: ['var(--hellmap-neon-green)', 'var(--hellmap-neon-blue)', 'var(--hellmap-fear-color)', 'var(--hellmap-anger-color)'][i % 4],
                top: `${20 + Math.random() * 60}%`,
                left: `${20 + Math.random() * 60}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </>
      )}

      {/* Main Content */}
      <div className="relative z-10 text-center">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-500 ${
                  index <= currentStep ? 'scale-125' : 'scale-100'
                }`}
                style={{
                  backgroundColor: index <= currentStep ? currentStepData.color : 'var(--hellmap-border)',
                  boxShadow: index <= currentStep ? `0 0 10px ${currentStepData.color}` : 'none'
                }}
              />
            ))}
          </div>
        </div>

        {/* Icon */}
        <div 
          className="mb-8 transform transition-all duration-1000 scale-110"
          style={{
            filter: `drop-shadow(0 0 30px ${currentStepData.color})`
          }}
        >
          <div className="animate-pulse">
            <IconComponent size={80} color={currentStepData.color} />
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-4 mb-8">
          <h1 
            className={`text-3xl lg:text-4xl hellmap-neon-text-shadow transform transition-all duration-1000 ${
              currentStep === 0 ? 'scale-110' : 'scale-100'
            }`}
            style={{ 
              color: currentStepData.color,
              textShadow: `0 0 20px ${currentStepData.color}`
            }}
          >
            {currentStepData.title}
          </h1>
          <p 
            className="text-lg lg:text-xl transition-all duration-500"
            style={{ color: 'var(--hellmap-text-primary)' }}
          >
            {currentStepData.subtitle}
          </p>
        </div>

        {/* Skip Button (only for first few steps) */}
        {currentStep < steps.length - 2 && (
          <button
            onClick={onComplete}
            className="px-4 py-2 rounded-lg border transition-all duration-300 hover:scale-105 opacity-60 hover:opacity-100"
            style={{
              backgroundColor: 'var(--hellmap-card-bg)',
              borderColor: 'var(--hellmap-border)',
              color: 'var(--hellmap-text-muted)'
            }}
          >
            건너뛰기
          </button>
        )}

        {/* Final Step Special Content */}
        {currentStep === steps.length - 1 && (
          <div className="mt-8 space-y-4">
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border animate-bounce"
              style={{ 
                backgroundColor: 'var(--hellmap-card-bg)',
                borderColor: 'var(--hellmap-neon-green)',
                color: 'var(--hellmap-neon-green)'
              }}
            >
              <span>🎉</span>
              <span>준비 완료!</span>
            </div>
            <p 
              className="text-sm"
              style={{ color: 'var(--hellmap-text-secondary)' }}
            >
              잠시 후 HellMap으로 이동합니다...
            </p>
          </div>
        )}
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full opacity-60"
            style={{
              backgroundColor: currentStepData.color,
              top: `${10 + (i * 15)}%`,
              left: `${5 + (i * 15)}%`,
              animation: `hellmapFloat ${3 + (i * 0.5)}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`
            }}
          />
        ))}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes hellmapGridFloat {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-10px, -10px); }
        }
        
        @keyframes hellmapFloat {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.6; }
          50% { transform: translateY(-20px) scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}