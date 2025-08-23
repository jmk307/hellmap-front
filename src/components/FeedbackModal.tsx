import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { HellMapLogo } from './icons/HellMapLogo';
import { PublicFeedbackBoard } from './PublicFeedbackBoard';

interface FeedbackModalProps {
  onClose: () => void;
  onSubmit: (feedback: FeedbackData) => void;
}

interface FeedbackData {
  feedbackType: 'FEATURE' | 'BUG' | 'IMPROVEMENT' | 'OTHER';
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  userNickname?: string;
}

export function FeedbackModal({ onClose, onSubmit }: FeedbackModalProps) {
  const [view, setView] = useState<'form' | 'public'>('public');
  const [feedbackType, setFeedbackType] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<string>('MEDIUM');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const feedbackTypes = [
    { value: 'FEATURE', label: '새로운 기능 제안', icon: '💡' },
    { value: 'BUG', label: '버그 리포트', icon: '🐛' },
    { value: 'IMPROVEMENT', label: '개선 사항', icon: '⚡' },
    { value: 'OTHER', label: '기타 의견', icon: '💬' }
  ];

  const priorities = [
    { value: 'LOW', label: '낮음', color: 'var(--hellmap-neon-blue)' },
    { value: 'MEDIUM', label: '보통', color: 'var(--hellmap-neon-orange)' },
    { value: 'HIGH', label: '높음', color: 'var(--hellmap-fear-color)' }
  ];

  const handleSubmit = async () => {
    if (!feedbackType || !title.trim() || !description.trim()) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const feedbackData: FeedbackData = {
        feedbackType: feedbackType as any,
        title: title.trim(),
        description: description.trim(),
        priority: priority as any,
        userNickname: localStorage.getItem('hellmap-user-data') 
          ? JSON.parse(localStorage.getItem('hellmap-user-data')!).nickname 
          : undefined
      };

      await onSubmit(feedbackData);
      
      // 성공 후 폼 초기화
      setFeedbackType('');
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      
      // 피드백 제출 후 공개 게시판으로 돌아가기
      setView('public');
    } catch (error) {
      console.error('피드백 제출 실패:', error);
      alert('피드백 제출에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 공개 피드백 게시판 보기
  if (view === 'public') {
    return (
      <PublicFeedbackBoard 
        onClose={onClose}
        onNewFeedback={() => setView('form')}
      />
    );
  }

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 backdrop-blur-md transition-all duration-300 ease-out overflow-y-auto"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      <div 
        className="w-full max-w-2xl max-h-[85vh] flex flex-col transition-all duration-300 ease-out my-3 sm:my-4"
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
        >
          {/* Header */}
          <div 
            className="p-4 sm:p-4 lg:p-5 border-b flex-shrink-0"
            style={{ borderColor: 'var(--hellmap-border)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HellMapLogo size={80} variant="minimal" />
                <div>
                  <h2 
                    className="text-2xl font-bold"
                    style={{ color: 'var(--hellmap-neon-green)' }}
                  >
                    베타 피드백
                  </h2>
                  <p 
                    className="text-sm"
                    style={{ color: 'var(--hellmap-text-secondary)' }}
                  >
                    헬맵을 더 좋게 만들어주세요! 🔥
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setView('public')}
                  className="px-3 py-1.5 rounded-lg border-2 transition-all duration-300 hover:scale-105 text-sm"
                  style={{
                    backgroundColor: 'var(--hellmap-card-bg)',
                    borderColor: 'var(--hellmap-neon-green)',
                    color: 'var(--hellmap-neon-green)'
                  }}
                >
                  🌍 피드백 게시판
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
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            {/* Feedback Type */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--hellmap-text-primary)' }}
              >
                피드백 유형 *
              </label>
              <Select value={feedbackType} onValueChange={setFeedbackType}>
                <SelectTrigger 
                  className="w-full"
                  style={{ 
                    backgroundColor: 'var(--hellmap-card-bg)',
                    borderColor: 'var(--hellmap-border)',
                    color: 'var(--hellmap-text-primary)'
                  }}
                >
                  <SelectValue placeholder="피드백 유형을 선택하세요" />
                </SelectTrigger>
                <SelectContent 
                  className="hellmap-select-content"
                  style={{ 
                    backgroundColor: 'var(--hellmap-card-bg)',
                    borderColor: 'var(--hellmap-border)'
                  }}
                >
                  {feedbackTypes.map((type) => (
                    <SelectItem 
                      key={type.value} 
                      value={type.value} 
                      className="text-sm hellmap-select-item"
                      style={{ color: 'var(--hellmap-text-primary)' }}
                    >
                      <div className="flex items-center gap-2">
                        <span>{type.icon}</span>
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--hellmap-text-primary)' }}
              >
                제목 *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="간단한 제목을 입력하세요"
                className="w-full px-3 py-2 rounded-lg border-2 text-sm transition-all duration-300 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--hellmap-card-bg)',
                  borderColor: 'var(--hellmap-border)',
                  color: 'var(--hellmap-text-primary)',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--hellmap-neon-green)';
                  e.target.style.boxShadow = '0 0 0 2px rgba(0, 255, 136, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--hellmap-border)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Description */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--hellmap-text-primary)' }}
              >
                상세 설명 *
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="자세한 설명을 입력해주세요. 구체적일수록 도움이 됩니다!"
                className="w-full min-h-[60px] px-3 py-2 rounded-lg border-2 text-sm resize-none transition-all duration-300 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--hellmap-card-bg)',
                  borderColor: 'var(--hellmap-border)',
                  color: 'var(--hellmap-text-primary)',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--hellmap-neon-green)';
                  e.target.style.boxShadow = '0 0 0 2px rgba(0, 255, 136, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--hellmap-border)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Priority */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--hellmap-text-primary)' }}
              >
                우선순위
              </label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger 
                  className="w-full"
                  style={{ 
                    backgroundColor: 'var(--hellmap-card-bg)',
                    borderColor: 'var(--hellmap-border)',
                    color: 'var(--hellmap-text-primary)'
                  }}
                >
                  <SelectValue placeholder="우선순위를 선택하세요" />
                </SelectTrigger>
                <SelectContent 
                  className="hellmap-select-content"
                  style={{ 
                    backgroundColor: 'var(--hellmap-card-bg)',
                    borderColor: 'var(--hellmap-border)'
                  }}
                >
                  {priorities.map((priority) => (
                    <SelectItem 
                      key={priority.value} 
                      value={priority.value} 
                      className="text-sm hellmap-select-item"
                      style={{ color: 'var(--hellmap-text-primary)' }}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: priority.color }}
                        />
                        <span>{priority.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tips */}
            <div 
              className="p-2 rounded-lg border"
              style={{
                backgroundColor: 'var(--hellmap-darker-bg)',
                borderColor: 'var(--hellmap-neon-blue)'
              }}
            >
              <h4 
                className="text-xs font-medium mb-1"
                style={{ color: 'var(--hellmap-neon-blue)' }}
              >
                💡 피드백 작성 팁
              </h4>
              <ul 
                className="text-xs space-y-0.5"
                style={{ color: 'var(--hellmap-text-secondary)' }}
              >
                <li>• 구체적인 상황과 사용 경험을 포함해주세요</li>
                <li>• 개선하고 싶은 부분을 명확히 설명해주세요</li>
                <li>• 버그의 경우 재현 방법을 자세히 적어주세요</li>
                <li>• 긍정적인 피드백도 환영합니다! 😊</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div 
            className="p-4 border-t flex items-center justify-between flex-shrink-0"
            style={{ borderColor: 'var(--hellmap-border)' }}
          >
            <Button
              onClick={() => setView('public')}
              className="px-4 py-1.5 rounded-lg border-2 transition-all duration-300 hover:scale-105 text-sm"
              style={{
                backgroundColor: 'var(--hellmap-card-bg)',
                borderColor: 'var(--hellmap-border)',
                color: 'var(--hellmap-text-secondary)'
              }}
            >
              취소
            </Button>
            
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !feedbackType || !title.trim() || !description.trim()}
              className="px-6 py-1.5 rounded-lg border-2 transition-all duration-300 hover:scale-105 hellmap-neon-glow disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              style={{
                backgroundColor: 'var(--hellmap-neon-green)',
                borderColor: 'var(--hellmap-neon-green)',
                color: 'black'
              }}
            >
              {isSubmitting ? '제출 중...' : '피드백 제출'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
} 