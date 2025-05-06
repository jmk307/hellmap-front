import './App.css'
import { useGoogleLogin } from '@react-oauth/google';
import { useState, useEffect } from 'react';
import axios from 'axios';

declare global {
  interface Window {
    Kakao: any;
  }
}

// 공통 Auth 응답 구조
interface AuthResponse {
  timestamp: string;
  status: number;
  success: boolean;
  data: {
    isValid: boolean;
    provider: string;
    providerId: string;
    accessToken: string;
  };
}

// 회원가입 응답 구조
interface SignupResponse {
  timestamp: string;
  status: number;
  success: boolean;
  data: {
    nickname: string;
    accessToken: string;
  };
}

// 닉네임 중복체크 응답 구조
interface NicknameCheckResponse {
  timestamp: string;
  status: number;
  success: boolean;
  data: boolean;
}

function App() {
  const [authResult, setAuthResult] = useState<AuthResponse | null>(null);
  const [signupResult, setSignupResult] = useState<SignupResponse | null>(null);
  const [nickname, setNickname] = useState('');
  const [nicknameAvailable, setNicknameAvailable] = useState<boolean | null>(null);
  const [nicknameCheckMsg, setNicknameCheckMsg] = useState('');
  const [checking, setChecking] = useState(false);
  const [nicknameValid, setNicknameValid] = useState<boolean>(false);
  const [nicknameValidationMsg, setNicknameValidationMsg] = useState('');

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log('Google access_token:', tokenResponse.access_token);
      try {
        const response = await axios.post<AuthResponse>('http://localhost:5000/api/auth/google', {
          accessToken: tokenResponse.access_token
        });
        setAuthResult(response.data);
        setSignupResult(null);
        setNickname('');
        setNicknameAvailable(null);
        setNicknameCheckMsg('');
        if (response.data.data.accessToken) {
          localStorage.setItem('accessToken', response.data.data.accessToken);
        }
        console.log('Login successful:', response.data);
      } catch (error) {
        console.error('Login failed:', error);
      }
    },
    onError: (error) => {
      console.error('Google login failed:', error);
    },
    scope: 'openid email profile',
    flow: 'implicit',
  });

  useEffect(() => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(import.meta.env.VITE_KAKAO_JS_KEY);
    }
  }, []);

  const handleKakaoLogin = () => {
    if (!window.Kakao || !window.Kakao.isInitialized()) {
      alert('카카오 SDK가 아직 초기화되지 않았습니다. 새로고침 해보세요.');
      return;
    }
    window.Kakao.Auth.login({
      scope: 'profile_nickname',
      success: function (authObj: any) {
        console.log('Kakao access_token:', authObj.access_token);
        axios.post<AuthResponse>('http://localhost:5000/api/auth/kakao', {
          accessToken: authObj.access_token,
        }).then(res => {
          setAuthResult(res.data);
          setSignupResult(null);
          setNickname('');
          setNicknameAvailable(null);
          setNicknameCheckMsg('');
          if (res.data.data.accessToken) {
            localStorage.setItem('accessToken', res.data.data.accessToken);
          }
          console.log('Kakao login successful:', res.data);
        }).catch(err => {
          console.error('Kakao login failed:', err);
        });
      },
      fail: function (err: any) {
        console.error('Kakao login failed:', err);
      },
    });
  };

  const handleNicknameCheck = async () => {
    if (!nickname) return;
    setChecking(true);
    setNicknameAvailable(null);
    setNicknameCheckMsg('');
    try {
      const response = await axios.get<NicknameCheckResponse>(`http://localhost:5000/api/auth?nickname=${encodeURIComponent(nickname)}`);
      if (response.data.data) {
        setNicknameAvailable(false);
        setNicknameCheckMsg('이미 사용 중인 닉네임입니다.');
      } else {
        setNicknameAvailable(true);
        setNicknameCheckMsg('사용 가능한 닉네임입니다.');
      }
    } catch (error) {
      setNicknameAvailable(null);
      setNicknameCheckMsg('닉네임 중복 체크 중 오류가 발생했습니다.');
    } finally {
      setChecking(false);
    }
  };

  const handleSignup = async () => {
    if (!authResult) return;
    try {
      const response = await axios.post<SignupResponse>('http://localhost:5000/api/auth/signup', {
        provider: authResult.data.provider.toLowerCase(),
        providerId: authResult.data.providerId,
        nickname: nickname,
      });
      setSignupResult(response.data);
      if (response.data.data.accessToken) {
        localStorage.setItem('accessToken', response.data.data.accessToken);
      }
      console.log('Signup successful:', response.data);
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  const handleLogout = () => {
    setAuthResult(null);
    setSignupResult(null);
    setNickname('');
    setNicknameAvailable(null);
    setNicknameCheckMsg('');
    localStorage.removeItem('accessToken');
  };

  const validateNickname = (value: string) => {
    const regex = /^[a-zA-Z0-9가-힣]{2,12}$/;
    if (!value) {
      setNicknameValidationMsg('닉네임을 입력하세요.');
      setNicknameValid(false);
      return;
    }
    if (!regex.test(value)) {
      setNicknameValidationMsg('2~12자, 한글/영문/숫자만 사용 가능합니다.');
      setNicknameValid(false);
      return;
    }
    setNicknameValidationMsg('사용 가능한 형식입니다.');
    setNicknameValid(true);
  };

  return (
    <div className="container">
      <h1>Social Login Test</h1>
      {!authResult ? (
        <>
          <button onClick={() => login()} className="google-login-button">
            Google 로그인
          </button>
          <button onClick={handleKakaoLogin} className="kakao-login-button">
            Kakao 로그인
          </button>
        </>
      ) : authResult.data.isValid ? (
        <div className="user-info">
          <pre>{JSON.stringify(authResult, null, 2)}</pre>
          <button onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      ) : (
        <div className="user-info">
          <pre>{JSON.stringify(authResult, null, 2)}</pre>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1rem 0' }}>
            <input
              type="text"
              placeholder="닉네임을 입력하세요"
              value={nickname}
              onChange={e => {
                const value = e.target.value;
                setNickname(value);
                setNicknameAvailable(null);
                setNicknameCheckMsg('');
                validateNickname(value);
              }}
              style={{ padding: '0.5rem' }}
            />
            <button onClick={handleNicknameCheck} disabled={!nicknameValid || checking}>
              {checking ? '확인 중...' : '중복 체크'}
            </button>
          </div>
          {nicknameValidationMsg && (
            <div style={{ color: nicknameValid ? 'green' : 'red', marginBottom: '0.5rem' }}>{nicknameValidationMsg}</div>
          )}
          {nicknameCheckMsg && (
            <div style={{ color: nicknameAvailable ? 'green' : 'red', marginBottom: '1rem' }}>{nicknameCheckMsg}</div>
          )}
          <button onClick={handleSignup} disabled={!nicknameAvailable}>
            회원가입
          </button>
          {signupResult && (
            <div style={{ marginTop: '1rem' }}>
              <pre>{JSON.stringify(signupResult, null, 2)}</pre>
            </div>
          )}
          <button onClick={handleLogout} style={{ marginTop: '1rem' }}>
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
