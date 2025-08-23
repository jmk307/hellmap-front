import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { HellMapLogo } from './icons/HellMapLogo';
export type FeedbackStatus = 'PENDING' | 'REVIEWING' | 'COMPLETED' | 'REJECTED';

export interface FeedbackItem {
  feedbackId: string;
  feedbackType: 'BUG' | 'FEATURE' | 'IMPROVEMENT' | 'OTHER';
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING' | 'REVIEWING' | 'COMPLETED' | 'REJECTED';
  author: string;
  createdAt: string;
  updatedAt?: string;
  review?: string | null;
  adminNickname?: string;
  responseAt?: string;
}

interface PublicFeedbackBoardProps {
  onClose: () => void;
  onNewFeedback: () => void;
}

export function PublicFeedbackBoard({ onClose, onNewFeedback }: PublicFeedbackBoardProps) {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | FeedbackStatus>('all');
  const [activeTypeFilter, setActiveTypeFilter] = useState<'all' | 'BUG' | 'FEATURE' | 'IMPROVEMENT' | 'OTHER'>('all');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState({ status: '', adminResponse: '' });

  const feedbackTypes = {
    FEATURE: { label: '새로운 기능 제안', icon: '💡', color: 'var(--hellmap-neon-blue)' },
    BUG: { label: '버그 리포트', icon: '🐛', color: 'var(--hellmap-fear-color)' },
    IMPROVEMENT: { label: '개선 사항', icon: '⚡', color: 'var(--hellmap-neon-orange)' },
    OTHER: { label: '기타 의견', icon: '💬', color: 'var(--hellmap-neon-green)' }
  };

  const statusConfig = {
    PENDING: { 
      label: '대기중', 
      color: 'var(--hellmap-text-muted)', 
      bgColor: 'rgba(128, 128, 128, 0.2)',
      icon: '⏳'
    },
    REVIEWING: { 
      label: '검토중', 
      color: 'var(--hellmap-neon-orange)', 
      bgColor: 'rgba(249, 115, 22, 0.2)',
      icon: '👀'
    },
    COMPLETED: { 
      label: '완료', 
      color: 'var(--hellmap-neon-green)', 
      bgColor: 'rgba(34, 197, 94, 0.2)',
      icon: '✅'
    },
    REJECTED: { 
      label: '거부', 
      color: 'var(--hellmap-fear-color)', 
      bgColor: 'rgba(220, 38, 127, 0.2)',
      icon: '❌'
    }
  };

  const priorityConfig = {
    LOW: { label: '낮음', color: 'var(--hellmap-neon-blue)' },
    MEDIUM: { label: '보통', color: 'var(--hellmap-neon-orange)' },
    HIGH: { label: '높음', color: 'var(--hellmap-fear-color)' }
  };

  // 공개 피드백 목록 조회
  const fetchPublicFeedbacks = async () => {
    setIsLoading(true);
    try {
      // 백엔드 API 호출
      const response = await fetch('https://www.api-hellmap.shop/api/feedbacks', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse = await response.json();
      
      if (!apiResponse.success) {
        throw new Error('백엔드에서 success: false 응답');
      }

      // 백엔드 데이터를 프론트엔드 형식으로 변환
      const backendFeedbacks = apiResponse.data || [];
      const transformedFeedbacks: FeedbackItem[] = backendFeedbacks.map((item: any) => ({
        feedbackId: item.feedbackId,
        feedbackType: item.feedbackType,
        title: item.title,
        description: item.description,
        priority: item.priority,
        status: item.status,
        author: item.author,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        review: item.review,
        adminNickname: item.adminNickname,
        responseAt: item.responseAt
      }));

      console.log('📊 변환된 피드백 데이터:', transformedFeedbacks);
      console.log('📊 피드백 상태들:', transformedFeedbacks.map(f => f.status));
      setFeedbacks(transformedFeedbacks);
    } catch (error) {
      console.error('공개 피드백 목록 조회 실패:', error);
      
      // API 실패 시 빈 배열로 설정하거나 모의 데이터 사용
      console.warn('⚠️ 백엔드 API 연결 실패. 모의 데이터를 사용합니다.');
      
      // 모의 데이터 (백엔드 API 실패 시 fallback)
      const mockPublicFeedbacks: FeedbackItem[] = [
        {
          feedbackId: '1',
          feedbackType: 'FEATURE',
          title: '지역별 필터링 기능 추가',
          description: '서울 외 다른 지역들도 선택해서 볼 수 있으면 좋겠습니다. 부산, 대구, 인천 등 주요 도시별로도 분류해서 보고 싶어요.',
          priority: 'MEDIUM',
          status: 'COMPLETED',
          author: '헬맵러버',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-20T15:45:00Z',
          review: '좋은 제안 감사합니다! 지역별 필터링 기능을 추가했습니다. 이제 전국 어디서나 제보를 등록하고 조회할 수 있습니다.',
          adminNickname: '헬맵팀',
          responseAt: '2024-01-20T15:45:00Z'
        },
        {
          feedbackId: '2',
          feedbackType: 'BUG',
          title: '제보 등록 시 에러 발생',
          description: '서울 외 지역에서 제보 등록할 때 "인자가 유효하지 않다" 에러가 발생합니다. 제주도에서 테스트했는데 계속 같은 에러가 나와요.',
          priority: 'HIGH',
          status: 'COMPLETED',
          author: '제주도살이',
          createdAt: '2024-01-18T14:20:00Z',
          updatedAt: '2024-01-18T16:30:00Z',
          review: '신고해주신 버그를 수정했습니다. 이제 전국 어디서나 제보 등록이 가능합니다!',
          adminNickname: '개발팀',
          responseAt: '2024-01-18T16:30:00Z'
        },
        {
          feedbackId: '3',
          feedbackType: 'IMPROVEMENT',
          title: '다크모드 지원',
          description: '밤에 사용할 때 눈이 아파서 다크모드가 있으면 좋겠어요. 특히 지도 부분이 너무 밝아서 불편합니다.',
          priority: 'LOW',
          status: 'REVIEWING',
          author: '야행성인간',
          createdAt: '2024-01-22T09:15:00Z',
          updatedAt: '2024-01-22T09:15:00Z'
        }
      ];

      setFeedbacks(mockPublicFeedbacks);
    } finally {
      setIsLoading(false);
    }
  };



  useEffect(() => {
    fetchPublicFeedbacks();
  }, []);

  const formatDate = (dateString: string) => {
    // 백엔드에서 이미 "yyyy년 M월 dd일" 형식으로 포맷된 문자열이 오므로 그대로 반환
    return dateString;
  };

  // 관리자 권한 체크 (닉네임이 "몽낙년"인 경우만)
  const isAdmin = () => {
    try {
      const userDataStr = localStorage.getItem('hellmap-user-data');
      if (!userDataStr) return false;
      
      const userData = JSON.parse(userDataStr);
      return userData.nickname === '몽낙년';
    } catch (error) {
      console.error('사용자 데이터 파싱 오류:', error);
      return false;
    }
  };

  // 피드백 수정 모드 시작
  const handleEditStart = (feedback: FeedbackItem) => {
    setEditData({
      status: feedback.status,
      adminResponse: feedback.review || ''
    });
    setIsEditMode(true);
  };

  // 피드백 수정 취소
  const handleEditCancel = () => {
    setIsEditMode(false);
    setEditData({ status: '', adminResponse: '' });
  };

  // 피드백 수정 저장
  const handleEditSave = async () => {
    if (!selectedFeedback) return;

    try {
      const response = await fetch(`https://www.api-hellmap.shop/api/feedbacks/${selectedFeedback.feedbackId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          status: editData.status,
          review: editData.adminResponse
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // 성공시 피드백 목록 새로고침
        await fetchPublicFeedbacks();
        
        // 선택된 피드백 업데이트
        const updatedFeedback = {
          ...selectedFeedback,
          status: editData.status as any,
          review: editData.adminResponse,
          adminNickname: '몽낙년',
          responseAt: new Date().toISOString()
        };
        setSelectedFeedback(updatedFeedback);
        
        setIsEditMode(false);
        alert('피드백이 성공적으로 수정되었습니다.');
      } else {
        throw new Error('피드백 수정 실패');
      }
    } catch (error) {
      console.error('피드백 수정 오류:', error);
      alert('피드백 수정 중 오류가 발생했습니다.');
    }
  };

  // 필터링된 피드백 목록
  const filteredFeedbacks = feedbacks.filter(feedback => {
    // 상태 필터링: 이제 직접 매칭
    const statusMatch = activeFilter === 'all' || feedback.status === activeFilter;
    
    const typeMatch = activeTypeFilter === 'all' || feedback.feedbackType === activeTypeFilter;
    return statusMatch && typeMatch;
  });

  // 필터링 디버깅
  console.log('🔍 현재 activeFilter:', activeFilter);
  console.log('🔍 전체 피드백 수:', feedbacks.length);
  console.log('🔍 필터링된 피드백 수:', filteredFeedbacks.length);
  console.log('🔍 피드백 상태 분포:', feedbacks.reduce((acc, f) => {
    acc[f.status] = (acc[f.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>));

  // 피드백 상세 보기
  if (selectedFeedback) {
    return (
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 backdrop-blur-md transition-all duration-300 ease-out overflow-y-auto"
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          animation: 'fadeIn 0.3s ease-out'
        }}
      >
        <div 
          className="w-full max-w-4xl max-h-[90vh] flex flex-col transition-all duration-300 ease-out my-3 sm:my-4"
          style={{
            animation: 'slideInUp 0.3s ease-out'
          }}
        >
          <Card 
            className="border hellmap-card-glow flex flex-col h-full shadow-2xl rounded-lg overflow-hidden"
            style={{
              backgroundColor: 'var(--hellmap-card-bg)',
              borderColor: statusConfig[selectedFeedback.status]?.color || 'var(--hellmap-border)',
              boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px ${statusConfig[selectedFeedback.status]?.bgColor || 'rgba(128, 128, 128, 0.3)'}`
            }}
          >
            {/* Header */}
            <div 
              className="p-4 sm:p-4 lg:p-5 border-b flex-shrink-0"
              style={{ borderColor: 'var(--hellmap-border)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <Button
                  onClick={() => setSelectedFeedback(null)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 transition-all duration-300 hover:scale-105 text-sm"
                  style={{
                    backgroundColor: 'var(--hellmap-card-bg)',
                    borderColor: 'var(--hellmap-border)',
                    color: 'var(--hellmap-text-secondary)'
                  }}
                >
                  ← 목록으로
                </Button>
                
                <Button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full border-2 hover:scale-110 transition-transform"
                  style={{
                    backgroundColor: 'var(--hellmap-card-bg)',
                    borderColor: 'var(--hellmap-border)',
                    color: 'var(--hellmap-text-secondary)'
                  }}
                >
                  ✕
                </Button>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {feedbackTypes[selectedFeedback.feedbackType].icon}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span 
                        className="text-xs font-medium px-2 py-1 rounded-full"
                        style={{ 
                          backgroundColor: statusConfig[selectedFeedback.status]?.bgColor || 'rgba(128, 128, 128, 0.2)',
                          color: statusConfig[selectedFeedback.status]?.color || 'var(--hellmap-text-muted)'
                        }}
                      >
                        {statusConfig[selectedFeedback.status]?.icon || '⏳'} {statusConfig[selectedFeedback.status]?.label || '알 수 없음'}
                      </span>
                      <span 
                        className="text-xs px-2 py-1 rounded-full"
                        style={{ 
                          backgroundColor: `${priorityConfig[selectedFeedback.priority].color}20`,
                          color: priorityConfig[selectedFeedback.priority].color 
                        }}
                      >
                        {priorityConfig[selectedFeedback.priority].label}
                      </span>
                    </div>
                    <h2 
                      className="text-xl font-bold"
                      style={{ color: 'var(--hellmap-text-primary)' }}
                    >
                      {selectedFeedback.title}
                    </h2>
                    <p 
                      className="text-sm"
                      style={{ color: 'var(--hellmap-text-secondary)' }}
                    >
                      {selectedFeedback.author} • {formatDate(selectedFeedback.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 flex-1 overflow-y-auto">
              {/* 피드백 내용 */}
              <div>
                <h3 
                  className="text-sm font-medium mb-2"
                  style={{ color: 'var(--hellmap-text-primary)' }}
                >
                  📝 피드백 내용
                </h3>
                <div 
                  className="p-3 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--hellmap-darker-bg)',
                    borderColor: 'var(--hellmap-border)',
                    color: 'var(--hellmap-text-primary)'
                  }}
                >
                  {selectedFeedback.description}
                </div>
              </div>

              {/* 관리자 수정 모드 또는 답변 표시 */}
              {isEditMode ? (
                <div>
                  <h3 
                    className="text-sm font-medium mb-2"
                    style={{ color: 'var(--hellmap-neon-orange)' }}
                  >
                    ⚡ 피드백 관리 (관리자 전용)
                  </h3>
                  <div className="space-y-3">
                    {/* 상태 수정 */}
                    <div>
                      <label 
                        className="block text-sm font-medium mb-1"
                        style={{ color: 'var(--hellmap-text-primary)' }}
                      >
                        처리 상태
                      </label>
                      <select
                        value={editData.status}
                        onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                        className="w-full p-2 rounded border"
                        style={{
                          backgroundColor: 'var(--hellmap-darker-bg)',
                          borderColor: 'var(--hellmap-border)',
                          color: 'var(--hellmap-text-primary)'
                        }}
                      >
                        <option value="PENDING">⏳ 검토 대기</option>
                        <option value="REVIEWING">👀 검토 중</option>
                        <option value="COMPLETED">✅ 완료</option>
                        <option value="REJECTED">❌ 거절</option>
                      </select>
                    </div>

                    {/* 관리자 응답 */}
                    <div>
                      <label 
                        className="block text-sm font-medium mb-1"
                        style={{ color: 'var(--hellmap-text-primary)' }}
                      >
                        관리자 응답
                      </label>
                      <textarea
                        value={editData.adminResponse}
                        onChange={(e) => setEditData({ ...editData, adminResponse: e.target.value })}
                        placeholder="사용자에게 전달할 응답을 작성해주세요..."
                        rows={4}
                        className="w-full p-3 rounded border resize-none"
                        style={{
                          backgroundColor: 'var(--hellmap-darker-bg)',
                          borderColor: 'var(--hellmap-border)',
                          color: 'var(--hellmap-text-primary)'
                        }}
                      />
                    </div>

                    {/* 수정 모드 버튼들 */}
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleEditSave}
                        className="flex-1"
                        style={{
                          backgroundColor: 'var(--hellmap-neon-green)',
                          color: 'black',
                          border: 'none'
                        }}
                      >
                        💾 저장
                      </Button>
                      <Button 
                        onClick={handleEditCancel}
                        className="flex-1"
                        variant="outline"
                        style={{
                          borderColor: 'var(--hellmap-border)',
                          color: 'var(--hellmap-text-secondary)'
                        }}
                      >
                        취소
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* 관리자 답변 표시 */}
                  {selectedFeedback.review && selectedFeedback.review !== null && (
                    <div>
                      <h3 
                        className="text-sm font-medium mb-2"
                        style={{ color: 'var(--hellmap-neon-green)' }}
                      >
                        💬 헬맵팀 답변
                      </h3>
                      <div 
                        className="p-3 rounded-lg border"
                        style={{
                          backgroundColor: 'rgba(34, 197, 94, 0.1)',
                          borderColor: 'var(--hellmap-neon-green)',
                          color: 'var(--hellmap-text-primary)'
                        }}
                      >
                        <p className="mb-2">{selectedFeedback.review}</p>
                        <div 
                          className="text-xs flex items-center gap-2"
                          style={{ color: 'var(--hellmap-text-muted)' }}
                        >
                          <span>답변자: Hellmap 운영자</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 관리자 전용 수정 버튼 */}
                  {isAdmin() && (
                    <div>
                      <Button 
                        onClick={() => handleEditStart(selectedFeedback)}
                        className="w-full"
                        style={{
                          backgroundColor: 'var(--hellmap-neon-orange)',
                          color: 'black',
                          border: 'none'
                        }}
                      >
                        ⚡ 피드백 관리하기 (관리자 전용)
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // 모달 닫기 핸들러 (수정 모드일 때 확인)
  const handleModalClose = () => {
    if (isEditMode) {
      if (confirm('수정 중인 내용이 있습니다. 정말 취소하시겠습니까?')) {
        setIsEditMode(false);
        setEditData({ status: '', adminResponse: '' });
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 backdrop-blur-md transition-all duration-300 ease-out overflow-y-auto"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        animation: 'fadeIn 0.3s ease-out'
      }}
      onClick={handleModalClose}
    >
      <div 
        className="w-full max-w-6xl max-h-[90vh] flex flex-col transition-all duration-300 ease-out my-3 sm:my-4"
        style={{
          animation: 'slideInUp 0.3s ease-out'
        }}
      >
        <Card 
          className="border hellmap-card-glow flex flex-col h-full shadow-2xl rounded-lg overflow-hidden"
          style={{ 
            backgroundColor: 'var(--hellmap-card-bg)',
            borderColor: 'var(--hellmap-neon-green)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(34, 197, 94, 0.3)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div 
            className="p-4 sm:p-4 lg:p-5 border-b flex-shrink-0"
            style={{ borderColor: 'var(--hellmap-border)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <HellMapLogo size={80} variant="minimal" />
                <div>
                  <h2 
                    className="text-2xl font-bold"
                    style={{ color: 'var(--hellmap-neon-green)' }}
                  >
                    공개 피드백 게시판
                  </h2>
                  <p 
                    className="text-sm"
                    style={{ color: 'var(--hellmap-text-secondary)' }}
                  >
                    모든 사용자의 피드백과 진행 상황을 투명하게 공개합니다
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={onNewFeedback}
                  className="px-4 py-2 rounded-lg border-2 transition-all duration-300 hover:scale-105 text-sm"
                  style={{
                    backgroundColor: 'var(--hellmap-neon-green)',
                    borderColor: 'var(--hellmap-neon-green)',
                    color: 'black'
                  }}
                >
                  + 새 피드백
                </Button>
                
                <Button
                  onClick={handleModalClose}
                  className="w-10 h-10 rounded-full border-2 hover:scale-110 transition-transform"
                  style={{
                    backgroundColor: 'var(--hellmap-card-bg)',
                    borderColor: 'var(--hellmap-border)',
                    color: 'var(--hellmap-text-secondary)'
                  }}
                >
                  ✕
                </Button>
              </div>
            </div>

            {/* 필터 버튼들 */}
            <div className="space-y-3">
              {/* 상태 필터 */}
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--hellmap-text-muted)' }}>상태별 필터</p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  <Button
                    onClick={() => setActiveFilter('all')}
                    className={`px-2 sm:px-3 py-1.5 rounded-lg border transition-all text-xs sm:text-sm whitespace-nowrap ${
                      activeFilter === 'all' ? 'border-2' : ''
                    }`}
                    style={{
                      backgroundColor: activeFilter === 'all' ? 'var(--hellmap-neon-green)' : 'var(--hellmap-card-bg)',
                      borderColor: activeFilter === 'all' ? 'var(--hellmap-neon-green)' : 'var(--hellmap-border)',
                      color: activeFilter === 'all' ? 'black' : 'var(--hellmap-text-secondary)'
                    }}
                  >
                    <span className="hidden sm:inline">전체 ({feedbacks.length})</span>
                    <span className="sm:hidden">전체</span>
                  </Button>
                  {Object.entries(statusConfig).map(([status, config]) => (
                    <Button
                      key={status}
                      onClick={() => setActiveFilter(status as FeedbackStatus)}
                      className={`px-2 sm:px-3 py-1.5 rounded-lg border transition-all text-xs sm:text-sm whitespace-nowrap ${
                        activeFilter === status ? 'border-2' : ''
                      }`}
                      style={{
                        backgroundColor: activeFilter === status ? config.color : 'var(--hellmap-card-bg)',
                        borderColor: config.color,
                        color: activeFilter === status ? (status === 'PENDING' ? 'white' : 'black') : config.color
                      }}
                    >
                      <span className="hidden sm:inline">{config.icon} {config.label} ({feedbacks.filter(f => f.status === status).length})</span>
                      <span className="sm:hidden">{config.icon} {config.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* 유형 필터 */}
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--hellmap-text-muted)' }}>유형별 필터</p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  <Button
                    onClick={() => setActiveTypeFilter('all')}
                    className={`px-2 sm:px-3 py-1.5 rounded-lg border transition-all text-xs sm:text-sm whitespace-nowrap ${
                      activeTypeFilter === 'all' ? 'border-2' : ''
                    }`}
                    style={{
                      backgroundColor: activeTypeFilter === 'all' ? 'var(--hellmap-neon-blue)' : 'var(--hellmap-card-bg)',
                      borderColor: activeTypeFilter === 'all' ? 'var(--hellmap-neon-blue)' : 'var(--hellmap-border)',
                      color: activeTypeFilter === 'all' ? 'black' : 'var(--hellmap-text-secondary)'
                    }}
                  >
                    전체
                  </Button>
                  {Object.entries(feedbackTypes).map(([type, config]) => (
                    <Button
                      key={type}
                      onClick={() => setActiveTypeFilter(type as any)}
                      className={`px-2 sm:px-3 py-1.5 rounded-lg border transition-all text-xs sm:text-sm whitespace-nowrap ${
                        activeTypeFilter === type ? 'border-2' : ''
                      }`}
                      style={{
                        backgroundColor: activeTypeFilter === type ? config.color : 'var(--hellmap-card-bg)',
                        borderColor: config.color,
                        color: activeTypeFilter === type ? 'black' : config.color
                      }}
                    >
                      <span className="hidden sm:inline">{config.icon} {config.label} ({feedbacks.filter(f => f.feedbackType === type).length})</span>
                      <span className="sm:hidden">{config.icon} {config.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-6 h-6 rounded-full animate-spin border-2 border-transparent border-t-current"
                    style={{ color: 'var(--hellmap-neon-green)' }}
                  />
                  <span style={{ color: 'var(--hellmap-text-secondary)' }}>피드백을 불러오는 중...</span>
                </div>
              </div>
            ) : filteredFeedbacks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <span className="text-4xl mb-3">🔍</span>
                <h3 
                  className="text-lg font-medium mb-2"
                  style={{ color: 'var(--hellmap-text-primary)' }}
                >
                  해당 조건의 피드백이 없어요
                </h3>
                <p 
                  className="text-sm mb-4"
                  style={{ color: 'var(--hellmap-text-secondary)' }}
                >
                  다른 필터를 선택하거나 새로운 피드백을 작성해보세요
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFeedbacks.map((feedback) => (
                  <div
                    key={feedback.feedbackId}
                    onClick={() => setSelectedFeedback(feedback)}
                    className="p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 hover:scale-[1.01]"
                    style={{
                      backgroundColor: 'var(--hellmap-darker-bg)',
                      borderColor: 'var(--hellmap-border)'
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span 
                          className="text-2xl flex-shrink-0"
                          style={{ color: feedbackTypes[feedback.feedbackType].color }}
                        >
                          {feedbackTypes[feedback.feedbackType].icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          {/* 모바일에서는 제목과 상태를 세로로 배치 */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                            <h3 
                              className="font-medium text-sm sm:text-base break-words line-clamp-2 sm:line-clamp-1 flex-1 min-w-0"
                              style={{ 
                                color: 'var(--hellmap-text-primary)',
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word'
                              }}
                            >
                              {feedback.title}
                            </h3>
                            <span 
                              className="text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 self-start sm:self-center"
                              style={{ 
                                backgroundColor: statusConfig[feedback.status]?.bgColor || 'rgba(128, 128, 128, 0.2)',
                                color: statusConfig[feedback.status]?.color || 'var(--hellmap-text-muted)'
                              }}
                            >
                              {statusConfig[feedback.status]?.icon || '⏳'} {statusConfig[feedback.status]?.label || '알 수 없음'}
                            </span>
                          </div>
                          <p 
                            className="text-sm mb-2 line-clamp-2"
                            style={{ color: 'var(--hellmap-text-secondary)' }}
                          >
                            {feedback.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs" style={{ color: 'var(--hellmap-text-muted)' }}>
                            <span className="flex items-center gap-1">
                              <span>👤</span>
                              <span className="truncate max-w-[100px] sm:max-w-none">{feedback.author}</span>
                            </span>
                            <span className="hidden sm:inline">•</span>
                            <span className="text-xs">{formatDate(feedback.createdAt)}</span>
                            <span className="hidden sm:inline">•</span>
                            <span 
                              className="text-xs whitespace-nowrap"
                              style={{ color: priorityConfig[feedback.priority].color }}
                            >
                              <span className="sm:hidden">{priorityConfig[feedback.priority].label}</span>
                              <span className="hidden sm:inline">{priorityConfig[feedback.priority].label} 우선순위</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <span 
                        className="text-lg ml-2 flex-shrink-0"
                        style={{ color: 'var(--hellmap-text-muted)' }}
                      >
                        →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
