import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { FireIcon } from './icons/EmotionIcons';

interface NicknameSetupProps {
  onComplete: (nickname: string) => void;
  checkNicknameDuplicate: (nickname: string) => Promise<boolean>;
}

export function NicknameSetup({ onComplete, checkNicknameDuplicate }: NicknameSetupProps) {
  const [nickname, setNickname] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);

  // 닉네임 유효성 검사
  const validateNickname = (value: string) => {
    if (value.length < 2) return '닉네임은 2글자 이상이어야 합니다';
    if (value.length > 12) return '닉네임은 12글자 이하여야 합니다';
    if (!/^[가-힣a-zA-Z0-9_]+$/.test(value)) return '한글, 영문, 숫자, _만 사용 가능합니다';
    if (/^\d+$/.test(value)) return '숫자만으로는 닉네임을 만들 수 없습니다';
    return '';
  };

  // 닉네임 중복 확인 (API)
  const handleNicknameChange = async (value: string) => {
    setNickname(value);
    setError('');
    setIsValid(false);

    const validationError = validateNickname(value);
    if (validationError) {
      setError(validationError);
      return;
    }

    // 중복 확인
    setIsChecking(true);
    try {
      const isAvailable = await checkNicknameDuplicate(value);
      if (isAvailable) {
        setIsValid(true);
        setError(''); // 에러 메시지 초기화
      } else {
        setError('이미 사용 중인 닉네임입니다');
        setIsValid(false);
      }
    } catch (error) {
      setError('닉네임 확인 중 오류가 발생했습니다');
      setIsValid(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    
    // 닉네임 저장 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onComplete(nickname);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid) {
      handleSubmit();
    }
  };

  // 랜덤 닉네임 생성
  const generateRandomNickname = () => {
    const adjectives = ['용감한', '무서운', '웃긴', '화난', '멋진', '귀여운', '강한', '빠른'];
    const nouns = ['늑대', '호랑이', '용', '독수리', '상어', '사자', '표범', '매'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 999) + 1;
    
    const randomNickname = `${adj}${noun}${number}`;
    handleNicknameChange(randomNickname);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ 
        backgroundColor: 'var(--hellmap-dark-bg)',
        backgroundImage: `
          radial-gradient(circle at 30% 70%, rgba(255, 0, 68, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 70% 30%, rgba(0, 255, 136, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, rgba(0, 204, 255, 0.05) 0%, transparent 50%)
        `
      }}
    >
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 136, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 136, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />
      
      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FireIcon size={40} />
            <h1 
              className="text-3xl hellmap-neon-text-shadow"
              style={{ color: 'var(--hellmap-neon-green)' }}
            >
              HELLMAP
            </h1>
          </div>
          <div 
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-6"
            style={{ 
              backgroundColor: 'var(--hellmap-card-bg)',
              borderColor: 'var(--hellmap-neon-green)',
              color: 'var(--hellmap-neon-green)'
            }}
          >
            <div 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: 'var(--hellmap-neon-green)' }}
            />
            <span className="text-sm">신규 회원</span>
          </div>
          
          <h2 
            className="text-2xl mb-2"
            style={{ color: 'var(--hellmap-text-primary)' }}
          >
            닉네임을 설정해주세요
          </h2>
          <p 
            className="text-sm opacity-80"
            style={{ color: 'var(--hellmap-text-secondary)' }}
          >
            지옥에서 사용할 당신만의 이름을 정해보세요
          </p>
        </div>

        {/* Nickname Setup Card */}
        <Card 
          className="p-6 lg:p-8 border hellmap-card-glow"
          style={{ 
            backgroundColor: 'var(--hellmap-card-bg)',
            borderColor: 'var(--hellmap-border-bright)'
          }}
        >
          <div className="space-y-6">
            {/* Input Section */}
            <div className="space-y-4">
              <div className="relative">
                <Input
                  value={nickname}
                  onChange={(e) => handleNicknameChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="닉네임을 입력하세요"
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-300 text-lg ${
                    error ? 'border-red-500' : 
                    isValid ? 'border-green-500' : 
                    'focus:border-blue-500'
                  }`}
                  style={{
                    backgroundColor: 'var(--hellmap-darker-bg)',
                    borderColor: error ? '#ef4444' : isValid ? 'var(--hellmap-neon-green)' : 'var(--hellmap-border)',
                    color: 'var(--hellmap-text-primary)'
                  }}
                  disabled={isSubmitting}
                />
                
                {/* Status Indicator */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {isChecking && (
                    <div 
                      className="w-5 h-5 rounded-full animate-spin border-2 border-transparent"
                      style={{ 
                        borderTopColor: 'var(--hellmap-neon-blue)',
                        borderRightColor: 'var(--hellmap-neon-green)'
                      }}
                    />
                  )}
                  {isValid && !isChecking && (
                    <div 
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--hellmap-neon-green)' }}
                    >
                      <span className="text-black text-sm">✓</span>
                    </div>
                  )}
                  {error && !isChecking && (
                    <div 
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#ef4444' }}
                    >
                      <span className="text-white text-sm">✕</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Error/Success Message */}
              {error && (
                <p className="text-sm text-red-400 flex items-center gap-2">
                  <span>⚠️</span>
                  {error}
                </p>
              )}
              {isValid && (
                <p className="text-sm flex items-center gap-2" style={{ color: 'var(--hellmap-neon-green)' }}>
                  <span>✨</span>
                  사용 가능한 닉네임입니다!
                </p>
              )}

              {/* Nickname Guidelines */}
              <div 
                className="p-4 rounded-lg border text-sm"
                style={{ 
                  backgroundColor: 'var(--hellmap-darker-bg)',
                  borderColor: 'var(--hellmap-border)',
                  color: 'var(--hellmap-text-muted)'
                }}
              >
                <div className="mb-2" style={{ color: 'var(--hellmap-text-secondary)' }}>
                  📝 닉네임 규칙
                </div>
                <ul className="space-y-1 text-xs">
                  <li>• 2~12글자 사이</li>
                  <li>• 한글, 영문, 숫자, _ 사용 가능</li>
                  <li>• 숫자만으로는 불가능</li>
                  <li>• 욕설, 비방 단어 사용 금지</li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={!isValid || isSubmitting}
                className={`w-full py-3 rounded-lg border-2 transition-all duration-300 ${
                  isValid && !isSubmitting ? 'hover:scale-105 active:scale-95' : ''
                }`}
                style={{
                  backgroundColor: isValid && !isSubmitting ? 'var(--hellmap-neon-green)' : 'var(--hellmap-card-bg)',
                  borderColor: isValid && !isSubmitting ? 'var(--hellmap-neon-green)' : 'var(--hellmap-border)',
                  color: isValid && !isSubmitting ? 'black' : 'var(--hellmap-text-muted)',
                  opacity: isValid && !isSubmitting ? 1 : 0.5
                }}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full animate-spin border-2 border-transparent border-t-black"
                    />
                    <span>설정 중...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>🚀</span>
                    <span className="text-lg font-medium">지옥 탐험 시작하기</span>
                  </div>
                )}
              </Button>

              {/* Random Nickname Button */}
              <Button
                onClick={generateRandomNickname}
                disabled={isSubmitting}
                className="w-full py-2 rounded-lg border transition-all duration-300 hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: 'var(--hellmap-card-bg)',
                  borderColor: 'var(--hellmap-border-bright)',
                  color: 'var(--hellmap-text-secondary)'
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>🎲</span>
                  <span>랜덤 닉네임 생성</span>
                </div>
              </Button>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p 
            className="text-xs"
            style={{ color: 'var(--hellmap-text-muted)' }}
          >
            닉네임은 나중에 마이페이지에서 변경할 수 있습니다
          </p>
        </div>

        {/* Floating Elements */}
        <div className="absolute -top-8 -left-8 w-16 h-16 rounded-full opacity-20 animate-pulse"
             style={{ backgroundColor: 'var(--hellmap-fear-color)' }} />
        <div className="absolute -bottom-8 -right-8 w-12 h-12 rounded-full opacity-15 animate-pulse"
             style={{ backgroundColor: 'var(--hellmap-laugh-color)' }} />
        <div className="absolute top-1/4 -right-4 w-8 h-8 rounded-full opacity-10 animate-pulse"
             style={{ backgroundColor: 'var(--hellmap-anger-color)' }} />
      </div>
    </div>
  );
}