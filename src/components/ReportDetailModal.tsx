import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { FearIcon, AngerIcon, LaughIcon } from './icons/EmotionIcons';

import { Report } from '../../types/report';

interface ReportDetailModalProps {
  report: Report;
  onClose: () => void;
  onLike?: (reportId: string) => void;
  onEdit?: (report: Report) => void;
  onDelete?: (report: Report) => void;
  userNickname?: string;
}

export function ReportDetailModal({ 
  report, 
  onClose, 
  onLike, 
  onEdit,
  onDelete,
  userNickname 
}: ReportDetailModalProps) {
  const [isLiked, setIsLiked] = useState(report.isLike || false);
  const [likeCount, setLikeCount] = useState(report.likes);

  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case 'SCARY': return 'var(--hellmap-fear-color)';
      case 'ANNOYING': return 'var(--hellmap-anger-color)';
      case 'FUNNY': return 'var(--hellmap-laugh-color)';
      default: return 'var(--hellmap-neon-blue)';
    }
  };

  const getEmotionIcon = (emotion: string) => {
    switch (emotion) {
      case 'SCARY': return FearIcon;
      case 'ANNOYING': return AngerIcon;
      case 'FUNNY': return LaughIcon;
      default: return FearIcon;
    }
  };

  const getEmotionGlow = (emotion: string) => {
    switch (emotion) {
      case 'SCARY': return 'hellmap-fear-glow';
      case 'ANNOYING': return 'hellmap-anger-glow';
      case 'FUNNY': return 'hellmap-laugh-glow';
      default: return '';
    }
  };

  const handleLike = () => {
    if (isLiked) {
      setLikeCount(prev => prev - 1);
    } else {
      setLikeCount(prev => prev + 1);
    }
    setIsLiked(!isLiked);
    
    if (onLike) {
      onLike(report.reportId);
    }
  };

  const IconComponent = getEmotionIcon(report.emotion);
  const isOwner = userNickname && report.author === userNickname;

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-start sm:items-center justify-center z-[100] p-0 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <Card 
        className={`max-w-2xl w-full min-h-full sm:min-h-0 sm:max-h-[90vh] border overflow-hidden rounded-none sm:rounded-lg my-0 sm:my-4 ${getEmotionGlow(report.emotion)}`}
        style={{
          backgroundColor: 'var(--hellmap-card-bg)',
          borderColor: getEmotionColor(report.emotion)
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full sm:max-h-[90vh]">
          {/* Header */}
          <div 
            className="p-4 lg:p-6 border-b flex-shrink-0"
            style={{ borderColor: 'var(--hellmap-border)' }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div 
                  className="p-2 rounded-lg shrink-0"
                  style={{ backgroundColor: `${getEmotionColor(report.emotion)}20` }}
                >
                  <IconComponent size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 
                      className="text-lg lg:text-xl truncate"
                      style={{ color: 'var(--hellmap-text-primary)' }}
                    >
                      {report.title}
                    </h2>
                    {report.isHot && (
                      <span 
                        className="text-xs px-2 py-1 rounded-full animate-pulse"
                        style={{ 
                          backgroundColor: 'var(--hellmap-neon-orange)',
                          color: 'black'
                        }}
                      >
                        HOT
                      </span>
                    )}
                    {isOwner && (
                      <span 
                        className="text-xs px-2 py-1 rounded-full border"
                        style={{ 
                          backgroundColor: 'var(--hellmap-card-bg)',
                          borderColor: 'var(--hellmap-neon-green)',
                          color: 'var(--hellmap-neon-green)'
                        }}
                      >
                        내 제보
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span style={{ color: 'var(--hellmap-text-muted)' }}>
                      👤 {report.author || '익명'}
                    </span>
                    <span style={{ color: 'var(--hellmap-text-muted)' }}>•</span>
                    <span style={{ color: 'var(--hellmap-text-muted)' }}>
                      📍 {report.location}
                    </span>
                    <span style={{ color: 'var(--hellmap-text-muted)' }}>•</span>
                    <span style={{ color: 'var(--hellmap-text-muted)' }}>
                      ⏰ {report.timeAgo}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                onClick={onClose}
                className="w-10 h-10 rounded-full border hover:scale-110 transition-transform shrink-0"
                style={{
                  backgroundColor: 'var(--hellmap-card-bg)',
                  borderColor: 'var(--hellmap-border)',
                  color: 'var(--hellmap-text-muted)'
                }}
              >
                ✕
              </Button>
            </div>
          </div>

          {/* Content */}
          <div 
            className="overflow-y-auto hellmap-scroll flex-1"
            style={{ 
              minHeight: '300px',
              maxHeight: 'none',
              '--scrollbar-color': getEmotionColor(report.emotion)
            } as React.CSSProperties}
          >
            <div className="p-4 lg:p-6">
              {/* Media Content */}
              {((report.imageUrl && typeof report.imageUrl === 'string' && report.imageUrl.trim() !== '') || 
                (report.videoUrl && typeof report.videoUrl === 'string' && report.videoUrl.trim() !== '')) && (
                <div className="relative rounded-lg overflow-hidden mb-4">
                  {(report.imageUrl && report.imageUrl.trim() !== '') ? (
                    <img
                      src={report.imageUrl}
                      alt={report.title}
                      className="w-full h-48 sm:h-64 lg:h-80 object-cover"
                    />
                  ) : (report.videoUrl && report.videoUrl.trim() !== '') ? (
                    <video
                      src={report.videoUrl}
                      className="w-full h-48 sm:h-64 lg:h-80 object-cover"
                      controls
                      autoPlay
                      muted
                      loop
                    />
                  ) : null}
                  
                  {/* Media Overlay */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
                    style={{
                      background: `linear-gradient(to top, ${getEmotionColor(report.emotion)}20, transparent)`
                    }}
                  />
                </div>
              )}

              {/* Main Content */}
              <div className="space-y-4">
                <div>
                  <h3 
                    className="text-lg mb-3"
                    style={{ color: 'var(--hellmap-text-primary)' }}
                  >
                    📝 상세 내용
                  </h3>
                  <p 
                    className="text-sm lg:text-base leading-relaxed whitespace-pre-wrap"
                    style={{ color: 'var(--hellmap-text-secondary)' }}
                  >
                    {report.content}
                  </p>
                </div>

                {/* Related Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div 
                    className="p-4 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--hellmap-darker-bg)',
                      borderColor: 'var(--hellmap-border)'
                    }}
                  >
                    <h4 
                      className="text-sm mb-2"
                      style={{ color: 'var(--hellmap-text-primary)' }}
                    >
                      📍 위치 정보
                    </h4>
                    <p 
                      className="text-sm"
                      style={{ color: 'var(--hellmap-text-secondary)' }}
                    >
                      {report.location}
                    </p>
                    <p 
                      className="text-xs mt-1"
                      style={{ color: 'var(--hellmap-text-muted)' }}
                    >
                      이 지역의 비슷한 제보들을 확인해보세요
                    </p>
                  </div>

                  <div 
                    className="p-4 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--hellmap-darker-bg)',
                      borderColor: 'var(--hellmap-border)'
                    }}
                  >
                    <h4 
                      className="text-sm mb-2"
                      style={{ color: 'var(--hellmap-text-primary)' }}
                    >
                      🔥 반응 통계
                    </h4>
                    <div className="flex items-center gap-4 text-sm">
                      <div 
                        className="text-center"
                        style={{ color: getEmotionColor(report.emotion) }}
                      >
                        <div className="text-lg">{likeCount}</div>
                        <div className="text-xs">공감</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Analysis */}
                <div 
                  className="p-4 rounded-lg border"
                  style={{
                    backgroundColor: `${getEmotionColor(report.emotion)}10`,
                    borderColor: getEmotionColor(report.emotion)
                  }}
                >
                  <h4 
                    className="text-sm mb-2 flex items-center gap-2"
                    style={{ color: getEmotionColor(report.emotion) }}
                  >
                    🤖 AI 분석
                  </h4>
                  <p 
                    className="text-sm"
                    style={{ color: 'var(--hellmap-text-secondary)' }}
                  >
                    이 제보는 <span style={{ color: getEmotionColor(report.emotion) }}>
                      {report.emotion === 'SCARY' ? '공포' : report.emotion === 'ANNOYING' ? '분노' : '유머'}
                    </span> 감정으로 분류되었습니다. 
                    {report.location}에서 비슷한 감정의 제보가 많이 올라오고 있어요.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div 
            className="p-4 lg:p-6 border-t flex-shrink-0"
            style={{ borderColor: 'var(--hellmap-border)' }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  onClick={handleLike}
                  className={`px-4 py-2 rounded-lg border transition-all duration-300 hover:scale-105 ${
                    isLiked ? 'scale-105' : ''
                  }`}
                  style={{
                    backgroundColor: isLiked ? getEmotionColor(report.emotion) : 'var(--hellmap-card-bg)',
                    borderColor: getEmotionColor(report.emotion),
                    color: isLiked ? 'black' : getEmotionColor(report.emotion)
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span>{isLiked ? '❤️' : '🤍'}</span>
                    <span className="text-sm">공감 {likeCount}</span>
                  </div>
                </Button>
              </div>

              {/* 작성자인 경우에만 수정/삭제 버튼 표시 */}
              {isOwner && (
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {onEdit && (
                    <Button
                      onClick={() => onEdit(report)}
                      className="px-4 py-2 rounded-lg border transition-all duration-300 hover:scale-105"
                      style={{
                        backgroundColor: getEmotionColor(report.emotion),
                        borderColor: getEmotionColor(report.emotion),
                        color: 'black'
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span>✏️</span>
                        <span className="text-sm">수정</span>
                      </div>
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      onClick={() => onDelete(report)}
                      className="px-4 py-2 rounded-lg border transition-all duration-300 hover:scale-105"
                      style={{
                        backgroundColor: 'var(--hellmap-fear-color)20',
                        borderColor: 'var(--hellmap-fear-color)',
                        color: 'var(--hellmap-fear-color)'
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span>🗑️</span>
                        <span className="text-sm">삭제</span>
                      </div>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}