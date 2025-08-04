
import { Button } from './ui/button';
import { Card } from './ui/card';
import { HellMapLogo } from './icons/HellMapLogo';

interface LoginPageProps {
  onSocialLogin: (provider: 'kakao' | 'google') => void;
}

export function LoginPage({ onSocialLogin }: LoginPageProps) {
  const handleKakaoLogin = () => {
    onSocialLogin('kakao');
  };

  const handleGoogleLogin = () => {
    onSocialLogin('google');
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ 
        backgroundColor: 'var(--hellmap-dark-bg)',
        backgroundImage: `
          radial-gradient(circle at 20% 80%, rgba(0, 255, 136, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(0, 204, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(255, 0, 68, 0.05) 0%, transparent 50%)
        `
      }}
    >
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 136, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 136, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
      
      <div className="relative z-10 w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <HellMapLogo size={300} variant="default" />
          </div>
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border"
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
            <span>BETA</span>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="text-center mb-8">
          <h2 
            className="text-2xl mb-2 hellmap-neon-text-shadow"
            style={{ color: 'var(--hellmap-text-primary)' }}
          >
            지옥에 오신 것을 환영합니다
          </h2>
          <p 
            className="text-lg opacity-80"
            style={{ color: 'var(--hellmap-text-secondary)' }}
          >
            오늘도 살아남기 위해 함께해요
          </p>
        </div>

        {/* Login Card */}
        <Card 
          className="p-6 lg:p-8 border hellmap-card-glow"
          style={{ 
            backgroundColor: 'var(--hellmap-card-bg)',
            borderColor: 'var(--hellmap-border-bright)'
          }}
        >
          <div className="space-y-6">
            {/* Title */}
            <div className="text-center">
              <h3 
                className="text-xl mb-2"
                style={{ color: 'var(--hellmap-text-primary)' }}
              >
                소셜 로그인
              </h3>
              <p 
                className="text-sm"
                style={{ color: 'var(--hellmap-text-muted)' }}
              >
                빠르고 안전하게 시작하세요
              </p>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-4">
              {/* Kakao Login */}
              <Button
                onClick={handleKakaoLogin}
                className="w-full py-3 rounded-lg border-2 transition-all duration-300 hover:scale-105 active:scale-95 group"
                style={{
                  backgroundColor: '#FEE500',
                  borderColor: '#FEE500',
                  color: '#3C1E1E'
                }}
              >
                <div className="flex items-center justify-center gap-3">
                  {/* Kakao Icon */}
                  <div className="w-6 h-6 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-5 h-5">
                      <path
                        fill="currentColor"
                        d="M12 3c5.799 0 10.5 3.664 10.5 8.185c0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"
                      />
                    </svg>
                  </div>
                  <span className="text-lg font-medium">카카오로 시작하기</span>
                </div>
              </Button>

              {/* Google Login */}
              <Button
                onClick={handleGoogleLogin}
                className="w-full py-3 rounded-lg border-2 transition-all duration-300 hover:scale-105 active:scale-95 group hellmap-card-glow"
                style={{
                  backgroundColor: 'var(--hellmap-card-bg)',
                  borderColor: 'var(--hellmap-border-bright)',
                  color: 'var(--hellmap-text-primary)'
                }}
              >
                <div className="flex items-center justify-center gap-3">
                  {/* Google Icon */}
                  <div className="w-6 h-6 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-5 h-5">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  </div>
                  <span className="text-lg font-medium">Google로 시작하기</span>
                </div>
              </Button>
            </div>



            {/* Terms */}
            <div className="text-center">
              <p 
                className="text-xs leading-relaxed"
                style={{ color: 'var(--hellmap-text-muted)' }}
              >
                로그인하면 HellMap의{' '}
                <button 
                  className="underline hover:no-underline transition-all"
                  style={{ color: 'var(--hellmap-neon-green)' }}
                >
                  이용 약관
                </button>
                {' '}및{' '}
                <button 
                  className="underline hover:no-underline transition-all"
                  style={{ color: 'var(--hellmap-neon-green)' }}
                >
                  개인정보 처리방침
                </button>
                에 동의하게 됩니다
              </p>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <div className="flex items-center justify-center gap-4 text-sm mb-4">
            <span style={{ color: 'var(--hellmap-text-muted)' }}>
              🔥 실시간 감정 공유 플랫폼
            </span>
          </div>
          <div className="flex items-center justify-center gap-6 text-xs">
            <button 
              className="hover:scale-105 transition-transform"
              style={{ color: 'var(--hellmap-text-muted)' }}
            >
              문의하기
            </button>
            <div 
              className="w-1 h-1 rounded-full"
              style={{ backgroundColor: 'var(--hellmap-text-muted)' }}
            />
            <button 
              className="hover:scale-105 transition-transform"
              style={{ color: 'var(--hellmap-text-muted)' }}
            >
              공지사항
            </button>
            <div 
              className="w-1 h-1 rounded-full"
              style={{ backgroundColor: 'var(--hellmap-text-muted)' }}
            />
            <button 
              className="hover:scale-105 transition-transform"
              style={{ color: 'var(--hellmap-text-muted)' }}
            >
              도움말
            </button>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute -top-10 -left-10 w-20 h-20 rounded-full opacity-20 animate-pulse"
             style={{ backgroundColor: 'var(--hellmap-neon-green)' }} />
        <div className="absolute -bottom-10 -right-10 w-16 h-16 rounded-full opacity-15 animate-pulse"
             style={{ backgroundColor: 'var(--hellmap-neon-blue)' }} />
        <div className="absolute top-1/2 -right-5 w-12 h-12 rounded-full opacity-10 animate-pulse"
             style={{ backgroundColor: 'var(--hellmap-fear-color)' }} />
      </div>
    </div>
  );
}