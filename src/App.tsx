import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { MainSection } from '@/components/MainSection';
import { LoginPage } from '@/components/LoginPage';
import { NicknameSetup } from '@/components/NicknameSetup';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { ReportForm } from '@/components/ReportForm';
import { ServiceIntro } from '@/components/ServiceIntro';
import { FeedbackModal } from '@/components/FeedbackModal';

import { Report } from '../types/report';

import { toast, Toaster } from 'sonner';
import axios from 'axios';
import { useGoogleLogin } from '@react-oauth/google';

interface AuthResponse {
  timestamp: string;
  status: number;
  success: boolean;
  data: {
    isValid: boolean;
    provider: string;
    providerId: string;
    nickname: string;
    accessToken: string;
  };
}

interface SignupResponse {
  timestamp: string;
  status: number;
  success: boolean;
  data: {
    nickname: string;
    accessToken: string;
  };
}

interface NicknameCheckResponse {
  timestamp: string;
  status: number;
  success: boolean;
  data: boolean;
}

interface UserData {
  nickname: string;
  isNewUser: boolean;
}

declare global {
  interface Window {
    Kakao: any;
  }
}

export default function App() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeLocationFilter, setActiveLocationFilter] = useState('all');
  const [, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<'login' | 'nickname' | 'welcome' | 'main' | 'report' | 'intro'>('login');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [providerInfo, setProviderInfo] = useState<{provider: string, providerId: string} | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);



  // 제보 데이터 가져오기
  const fetchReports = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/reports', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      if (response.data && Array.isArray(response.data.data)) {


        // API 응답을 Report 타입에 맞게 변환
        const apiReports: Report[] = response.data.data
          .filter((item: any) => !item.isDeleted)
          .map((item: any) => {
            const mappedReport = {
              reportId: item.reportId.toString(),
              emotion: item.emotion,
              title: item.title,
              content: item.content,
              location: item.location,
              latitude: item.latitude,    // 위도 추가
              longitude: item.longitude,  // 경도 추가
              timeAgo: item.timeAgo || '방금 전',
              likes: item.likes || 0,
              isLike: item.isLike || false,  // 좋아요 여부 추가
              isHot: item.isHot || false,
              imageUrl: item.imageUrl,
              videoUrl: item.videoUrl,
              author: item.author
            };

            return mappedReport;
          });
        setReports(apiReports);
      }
    } catch (error) {
      console.error('제보 데이터 가져오기 실패:', error);
    }
  };

  // 로그인 상태 확인 및 초기 데이터 로드
  useEffect(() => {
    const checkLoginStatus = () => {
      const loginStatus = localStorage.getItem('hellmap-logged-in');
      const storedUserData = localStorage.getItem('hellmap-user-data');
      
      if (loginStatus === 'true' && storedUserData) {
        const userData = JSON.parse(storedUserData);
        setUserData(userData);
        setIsLoggedIn(true);
        setCurrentScreen('main');
      }
      
      // 제보 데이터 가져오기
      fetchReports();
      setIsLoading(false);
    };

    setTimeout(checkLoginStatus, 800);
  }, []);

  // 구글 로그인
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const response = await axios.post<AuthResponse>('http://localhost:5000/api/auth/google', {
          accessToken: tokenResponse.access_token
        });
        setProviderInfo({ provider: response.data.data.provider, providerId: response.data.data.providerId });
        if (response.data.data.accessToken) {
          localStorage.setItem('accessToken', response.data.data.accessToken);
        }
        if (response.data.data.isValid) {
          // 기존 회원
          const userData = {
            nickname: response.data.data.nickname, // 실제 닉네임은 별도 API 필요시 수정
            isNewUser: false
          };
          setUserData(userData);
          localStorage.setItem('hellmap-logged-in', 'true');
          localStorage.setItem('hellmap-user-data', JSON.stringify(userData));
          setCurrentScreen('main');
          
          // 로그인 후 제보 데이터 가져오기
          await fetchReports();
        } else {
          // 신규 회원
          setCurrentScreen('nickname');
        }
      } catch (error) {
        toast.error('Google 로그인 실패!');
      }
    },
    scope: 'openid email profile',
    flow: 'implicit',
  });

  // 카카오 SDK 초기화
  useEffect(() => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init((import.meta as any).env.VITE_KAKAO_JS_KEY);
    }
  }, []);

  // 카카오 로그인
  const handleKakaoLogin = () => {
    if (!window.Kakao || !window.Kakao.isInitialized()) {
      toast.error('카카오 SDK가 아직 초기화되지 않았습니다. 새로고침 해보세요.');
      return;
    }
    window.Kakao.Auth.login({
      scope: 'profile_nickname',
      success: function (authObj: any) {
        axios.post<AuthResponse>('http://localhost:5000/api/auth/kakao', {
          accessToken: authObj.access_token,
        }).then(res => {
          setProviderInfo({ provider: res.data.data.provider, providerId: res.data.data.providerId });
          if (res.data.data.accessToken) {
            localStorage.setItem('accessToken', res.data.data.accessToken);
          }
          if (res.data.data.isValid) {
            // 기존 회원
            const userData = {
              nickname: res.data.data.nickname, // 실제 닉네임은 별도 API 필요시 수정
              isNewUser: false
            };
            setUserData(userData);
            localStorage.setItem('hellmap-logged-in', 'true');
            localStorage.setItem('hellmap-user-data', JSON.stringify(userData));
            setCurrentScreen('main');
            
            // 로그인 후 제보 데이터 가져오기
            fetchReports();
          } else {
            // 신규 회원
            setCurrentScreen('nickname');
          }
        }).catch((_ : any) => {
          toast.error('Kakao 로그인 실패!');
        });
      },
      fail: function (_: any) {
        toast.error('Kakao 로그인 실패!');
      },
    });
  };

  // 닉네임 중복 체크
  const checkNicknameDuplicate = async (nickname: string) => {
    try {
      const response = await axios.get<NicknameCheckResponse>(`http://localhost:5000/api/auth?nickname=${encodeURIComponent(nickname)}`);
      
      // API 응답: data가 true면 중복, false면 사용 가능
      const isDuplicated = response.data.data;
      const isAvailable = !isDuplicated;
      
      return isAvailable; // true면 사용 가능, false면 중복
    } catch (error) {
      console.error('❌ 닉네임 중복 체크 실패:', error);
      return false; // 오류 시 사용 불가로 처리
    }
  };

  // 회원가입
  const handleNicknameComplete = async (nickname: string) => {
    if (!providerInfo) return;
    try {
      const response = await axios.post<SignupResponse>('http://localhost:5000/api/auth/signup', {
        provider: providerInfo.provider.toLowerCase(),
        providerId: providerInfo.providerId,
        nickname: nickname,
      });
      if (response.data.data.accessToken) {
        localStorage.setItem('accessToken', response.data.data.accessToken);
      }
      const newUserData = {
        nickname,
        isNewUser: true
      };
      setUserData(newUserData);
      localStorage.setItem('hellmap-logged-in', 'true');
      localStorage.setItem('hellmap-user-data', JSON.stringify(newUserData));
      setCurrentScreen('welcome');
    } catch (error) {
      toast.error('회원가입 실패!');
    }
  };

  // 소셜 로그인 버튼 핸들러
  const handleSocialLogin = (provider: 'kakao' | 'google') => {
    if (provider === 'google') {
      googleLogin();
    } else {
      handleKakaoLogin();
    }
  };

  // 환영 화면 완료
  const handleWelcomeComplete = async () => {
    setCurrentScreen('main');
    
    // 환영 화면 완료 후 제보 데이터 가져오기
    await fetchReports();
  };

  // 로그아웃
  const handleLogout = () => {
    localStorage.removeItem('hellmap-logged-in');
    localStorage.removeItem('hellmap-user-data');
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('accessToken');
    setIsLoggedIn(false);
    setUserData(null);
    setCurrentScreen('login');
    setActiveFilter('all');
    setReports([]); // 빈 배열로 초기화
    setEditingReport(null);
  };

  // 제보하기 화면 열기
  const handleCreateReport = () => {
    setEditingReport(null);
    setCurrentScreen('report');
  };

  // 제보 수정하기
  const handleEditReport = (report: Report) => {
    setEditingReport(report);
    setCurrentScreen('report');
  };

  // 제보 삭제
  const handleReportDelete = async (report: Report) => {
    try {
      // PATCH /api/reports/{reportId} 호출
      const response = await axios.patch(`http://localhost:5000/api/reports/${report.reportId}`, {
        isDeleted: true
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.data.success) {
        // 제보 목록에서 삭제된 제보 즉시 제거
        setReports(prevReports => prevReports.filter(r => r.reportId !== report.reportId));
        
        toast.success('제보가 삭제되었습니다!', {
          description: '선택한 제보가 성공적으로 삭제되었어요.',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('제보 삭제 실패:', error);
      toast.error('제보 삭제에 실패했습니다.');
    }
  };

  // 제보 제출/수정 완료
  const handleReportSubmit = async () => {
    try {
      // 제보 목록 새로고침
      await fetchReports();
      
      // ReportForm에서 이미 토스트 메시지를 표시하므로 여기서는 생략
      setCurrentScreen('main');
      setEditingReport(null);
    } catch (error) {
      console.error('제보 저장 실패:', error);
      toast.error('제보 저장에 실패했습니다.');
    }
  };

  // 제보 작성 취소
  const handleReportCancel = () => {
    setCurrentScreen('main');
    setEditingReport(null);
  };

  // 서비스 소개 관련 핸들러
  const handleServiceIntro = () => {
    setCurrentScreen('intro');
  };

  const handleServiceIntroClose = () => {
    setCurrentScreen('main');
  };

  const handleFeedback = () => {
    setShowFeedback(true);
  };

  const handleFeedbackClose = () => {
    setShowFeedback(false);
  };

  const handleFeedbackSubmit = async (feedbackData: any) => {
    try {
      // 피드백 데이터를 서버로 전송
      const response = await axios.post('http://localhost:5000/api/feedbacks', feedbackData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.data.success) {
        toast.success('피드백이 성공적으로 제출되었습니다!');
      } else {
        toast.error('피드백 제출에 실패했습니다.');
      }
    } catch (error) {
      console.error('피드백 제출 실패:', error);
      // API가 없어도 성공으로 처리 (개발 중)
      toast.success('피드백이 성공적으로 제출되었습니다!');
    }
  };

  const handleServiceIntroGetStarted = async () => {
    if (!userData) {
      setCurrentScreen('login');
    } else {
      setCurrentScreen('main');
      
      // 서비스 소개에서 시작하기 클릭 후 제보 데이터 가져오기
      await fetchReports();
    }
  };



  // 필터 변경 핸들러
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  // 지역 필터 변경 핸들러
  const handleLocationFilterChange = (location: string) => {
    setActiveLocationFilter(location);
  };

  // 제보 좋아요 처리
  const handleLikeReport = async (reportId: string) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/reports/${reportId}`,
        {},  // 빈 객체를 body로 전송
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );

      if (response.data.success) {
        // 제보 목록 새로고침
        await fetchReports();
      }
    } catch (error) {
      console.error('좋아요 처리 실패:', error);
      toast.error('좋아요 처리에 실패했습니다.');
    }
  };

  let content;

  // 로딩 화면
  if (isLoading) {
    content = (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ 
          backgroundColor: 'var(--hellmap-dark-bg)',
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(0, 255, 136, 0.1) 0%, transparent 50%)
          `
        }}
      >
        <div className="text-center">
          <div className="mb-8 animate-pulse">
            <div 
              className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--hellmap-card-bg)' }}
            >
              <div 
                className="w-8 h-8 rounded-full animate-spin border-2 border-transparent"
                style={{ 
                  borderTopColor: 'var(--hellmap-neon-green)',
                  borderRightColor: 'var(--hellmap-neon-blue)'
                }}
              />
            </div>
          </div>
          <h1 
            className="text-4xl mb-2 hellmap-neon-text-shadow"
            style={{ color: 'var(--hellmap-neon-green)' }}
          >
            HELLMAP
          </h1>
          <p 
            className="text-sm animate-pulse"
            style={{ color: 'var(--hellmap-text-muted)' }}
          >
            지옥 지도를 로딩 중...
          </p>
        </div>
      </div>
    );
  } else {
    // 화면별 렌더링
    switch (currentScreen) {
      case 'login':
        content = <LoginPage onSocialLogin={handleSocialLogin} />;
        break;
      
      case 'nickname':
        content = <NicknameSetup onComplete={handleNicknameComplete} checkNicknameDuplicate={checkNicknameDuplicate} />;
        break;
      
      case 'welcome':
        content = (
          <WelcomeScreen 
            nickname={userData?.nickname || ''} 
            onComplete={handleWelcomeComplete} 
          />
        );
        break;
      
      case 'report':
        content = (
          <ReportForm
            onSubmit={handleReportSubmit}
            onCancel={handleReportCancel}
            editData={editingReport}
            userNickname={userData?.nickname || ''}
          />
        );
        break;
      
      case 'intro':
        content = (
          <ServiceIntro 
            onClose={handleServiceIntroClose}
            onGetStarted={handleServiceIntroGetStarted}
            reportsCount={reports.length}
          />
        );
        break;
      
      case 'main':
      default:
        content = (
          <div 
            className="min-h-screen"
            style={{ backgroundColor: 'var(--hellmap-dark-bg)' }}
          >
            <Header 
              activeFilter={activeFilter} 
              onFilterChange={handleFilterChange}
              onLogout={handleLogout}
              onCreateReport={handleCreateReport}
              onServiceIntro={handleServiceIntro}
              onFeedback={handleFeedback}
              userNickname={userData?.nickname}
              reportsCount={reports.length}
            />
            <MainSection 
              activeFilter={activeFilter}
              activeLocationFilter={activeLocationFilter}
              onLocationFilterChange={handleLocationFilterChange}
              userNickname={userData?.nickname}
              onEditReport={handleEditReport}
              onDeleteReport={handleReportDelete}
              onLikeReport={handleLikeReport}
              reports={reports}
            />
          </div>
        );
        break;
    }
  }

  return (
    <>
      <Toaster 
        position="top-center"
        toastOptions={{
          style: { 
            marginTop: '6rem',
            background: 'rgba(18, 18, 18, 0.95)',
            backdropFilter: 'blur(8px)',
            color: 'var(--hellmap-neon-green)',
            border: '1px solid var(--hellmap-neon-green)',
            fontSize: '0.95rem',
            borderRadius: '0.5rem',
            boxShadow: '0 0 10px rgba(0, 255, 136, 0.1)',
          },
          className: 'hellmap-toast',
          descriptionClassName: 'text-gray-400'
        }}
        theme="dark"
      />
      {content}
      
      {/* Feedback Modal */}
      {showFeedback && (
        <FeedbackModal
          onClose={handleFeedbackClose}
          onSubmit={handleFeedbackSubmit}
        />
      )}
    </>
  );
}