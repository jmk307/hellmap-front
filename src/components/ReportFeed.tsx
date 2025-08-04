import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card } from './ui/card';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { FearIcon, AngerIcon, LaughIcon } from './icons/EmotionIcons';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ReportDetailModal } from './ReportDetailModal';
import { Report } from '../../types/report';

interface ReportFeedProps {
  activeFilter: string;
  activeLocationFilter?: string;  // 지역 필터 추가
  onLocationFilterChange?: (location: string) => void;  // 지역 필터 변경 핸들러
  userNickname?: string;
  onEditReport?: (report: Report) => void;
  onDeleteReport?: (report: Report) => void;
  onLikeReport?: (reportId: string) => void;  // 좋아요 핸들러 추가
  reports?: Report[];
}

export function ReportFeed({ 
  activeFilter, 
  activeLocationFilter = 'all',
  onLocationFilterChange,
  userNickname, 
  onEditReport,
  onDeleteReport,
  onLikeReport,
  reports: externalReports 
}: ReportFeedProps) {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [page, setPage] = useState(1);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const [reports, setReports] = useState<Report[]>([]);
  const PAGE_SIZE = 5;
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  // 외부 reports가 변경될 때마다 내부 상태 업데이트
  useEffect(() => {
    if (externalReports) {
  
      setReports(externalReports);
      setPage(1); // 페이지 초기화
    }
  }, [externalReports]);

  // 필터가 변경될 때 페이지 초기화
  useEffect(() => {

    setPage(1);
    loadingRef.current = false; // 로딩 상태도 초기화
  }, [activeFilter, activeLocationFilter]);

  // 시간 형식 변환 함수


  // 주소를 구까지만 표시하는 함수 추가
  const formatLocation = (fullAddress: string) => {
    const parts = fullAddress.split(' ');
    // 시/도와 구/군까지만 표시 (예: "서울특별시 강남구")
    if (parts.length >= 2) {
      return parts.slice(0, 2).join(' ');
    }
    return fullAddress; // 주소 형식이 다른 경우 전체 주소 반환
  };

  // 고유한 지역 목록을 추출하는 함수
  const getUniqueLocations = (reports: Report[]) => {
    const locations = reports.map(report => formatLocation(report.location));
    return [...new Set(locations)].sort();
  };

  // 지역별 제보 개수를 계산하는 함수
  const getLocationCounts = (reports: Report[]) => {
    const counts: { [key: string]: number } = {};
    reports.forEach(report => {
      const location = formatLocation(report.location);
      counts[location] = (counts[location] || 0) + 1;
    });
    return counts;
  };

  // 감정과 지역 복합 필터링
  const filteredReports = reports.filter(report => {
    // 감정 필터링
    const emotionMatch = activeFilter === 'all' || report.emotion === activeFilter;
    
    // 지역 필터링
    const locationMatch = activeLocationFilter === 'all' || 
      formatLocation(report.location) === activeLocationFilter;
    
    return emotionMatch && locationMatch;
  });

  // 필터링 결과 로그
  

  const pagedReports = filteredReports.slice(0, page * PAGE_SIZE);
  const hasMore = pagedReports.length < filteredReports.length;

  // 필터링과 페이징 상태 디버깅 (기본 상태값만 의존성으로 사용)
  useEffect(() => {

  }, [reports.length, activeFilter, activeLocationFilter, page]); // 지역 필터도 의존성에 추가

  // 무한 스크롤 핸들러
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || loadingRef.current) return;
    
    // 스크롤 위치 확인 (마지막 근처에 도달했는지)
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50) {
      if (pagedReports.length < filteredReports.length) {
  
        loadingRef.current = true;
        setTimeout(() => {
          setPage((prev) => {
    
            return prev + 1;
          });
          loadingRef.current = false;
        }, 200);
      }
    }
  }, [reports.length, activeFilter, activeLocationFilter, page]); // 지역 필터도 의존성에 추가

  // 스크롤 이벤트 리스너 등록
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;


    
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll, activeFilter, activeLocationFilter]); // 필터 변경 시에도 리스너 재등록

  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case 'SCARY': return 'var(--hellmap-fear-color)';
      case 'ANNOYING': return 'var(--hellmap-anger-color)';
      case 'FUNNY': return 'var(--hellmap-laugh-color)';
      default: return 'var(--hellmap-neon-blue)';
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

  const getEmotionIcon = (emotion: string) => {
    switch (emotion) {
      case 'SCARY': return FearIcon;
      case 'ANNOYING': return AngerIcon;
      case 'FUNNY': return LaughIcon;
      default: return FearIcon;
    }
  };

  // 내 제보인지 확인
  const isMyReport = (report: Report) => {
    return userNickname && report.author === userNickname;
  };

  const handleReportClick = (report: Report) => {
    setSelectedReport(report);
  };

  const handleEditFromModal = (report: Report) => {
    setSelectedReport(null);
    if (onEditReport) {
      onEditReport(report);
    }
  };

  const handleDeleteFromModal = (report: Report) => {
    setSelectedReport(null);
    if (onDeleteReport) {
      onDeleteReport(report);
    }
  };

  // 좋아요 핸들러 추가
  const handleLike = (e: React.MouseEvent, report: Report) => {
    e.stopPropagation(); // 상세보기가 열리는 것을 방지
    
    if (onLikeReport) {
      onLikeReport(report.reportId);
      
      // 낙관적 업데이트
      setReports(prevReports => prevReports.map(r => {
        if (r.reportId === report.reportId) {
          return {
            ...r,
            isLike: !r.isLike,
            likes: r.isLike ? r.likes - 1 : r.likes + 1
          };
        }
        return r;
      }));
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div 
        className="p-3 lg:p-4 border-b"
        style={{ 
          backgroundColor: 'var(--hellmap-card-bg)',
          borderColor: 'var(--hellmap-border)'
        }}
      >
        <div className="flex items-center justify-between mb-2 lg:mb-3">
          <h2 
            className="text-base lg:text-lg hellmap-neon-text-shadow"
            style={{ color: 'var(--hellmap-neon-green)' }}
          >
            🔥 실시간 제보
          </h2>
          <div className="flex items-center gap-2">
            <div 
              className="px-2 py-1 rounded-full text-xs animate-pulse"
              style={{ 
                backgroundColor: 'var(--hellmap-fear-color)',
                color: 'white'
              }}
            >
              LIVE
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs lg:text-sm mb-2">
          <span style={{ color: 'var(--hellmap-text-secondary)' }}>
            총 <span style={{ color: 'var(--hellmap-neon-blue)' }}>{filteredReports.length}개</span> 제보
          </span>
          <span style={{ color: 'var(--hellmap-text-muted)' }}>
            업데이트: 방금 전
          </span>
        </div>

        {/* 지역 필터 */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium" style={{ color: 'var(--hellmap-text-secondary)' }}>
            📍 지역:
          </span>
          <Select value={activeLocationFilter} onValueChange={onLocationFilterChange}>
            <SelectTrigger 
              className="w-40 h-8 text-xs"
              style={{ 
                backgroundColor: 'var(--hellmap-card-bg)',
                borderColor: 'var(--hellmap-border)',
                color: 'var(--hellmap-text-primary)'
              }}
            >
              <SelectValue placeholder="지역 선택" />
            </SelectTrigger>
            <SelectContent 
              className="hellmap-select-content"
              style={{ 
                backgroundColor: 'var(--hellmap-card-bg)',
                borderColor: 'var(--hellmap-border)'
              }}
            >
              <SelectItem 
                value="all" 
                className="text-xs hellmap-select-item"
                style={{ color: 'var(--hellmap-text-primary)' }}
              >
                전체 지역 ({reports.length})
              </SelectItem>
              {getUniqueLocations(reports).map(location => {
                const count = getLocationCounts(reports)[location];
                return (
                  <SelectItem 
                    key={location} 
                    value={location} 
                    className="text-xs hellmap-select-item"
                    style={{ color: 'var(--hellmap-text-primary)' }}
                  >
                    {location} ({count})
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Feed Content */}
      <div 
        className="flex-1 overflow-y-auto min-h-0 hellmap-scroll"
        ref={scrollRef}
      >
        <div className="p-2 lg:p-3 space-y-2 lg:space-y-3">
          {/* 로딩 상태 */}
          {loading && reports.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--hellmap-neon-blue)' }} />
            </div>
          )}

          {/* 에러 상태 */}
          {error && reports.length === 0 && (
            <div className="text-center py-8">
              <div className="text-2xl mb-2">⚠️</div>
              <p style={{ color: 'var(--hellmap-fear-color)' }}>{error}</p>
              <button
                onClick={() => {}} // Removed fetchReports as it's no longer defined
                className="mt-4 px-4 py-2 rounded-lg border transition-all hover:scale-105"
                style={{
                  backgroundColor: 'var(--hellmap-card-bg)',
                  borderColor: 'var(--hellmap-neon-blue)',
                  color: 'var(--hellmap-neon-blue)'
                }}
              >
                다시 시도
              </button>
            </div>
          )}

          {/* 제보 목록 */}
          {pagedReports.map((report) => {
            const IconComponent = getEmotionIcon(report.emotion);
            const isOwner = isMyReport(report);
            
            return (
              <Card 
                key={report.reportId} 
                className={`cursor-pointer hover:scale-[1.01] lg:hover:scale-[1.02] transition-all duration-200 border overflow-hidden ${getEmotionGlow(report.emotion)}`}
                style={{ 
                  backgroundColor: 'var(--hellmap-card-bg)',
                  borderColor: getEmotionColor(report.emotion)
                }}
                onClick={() => handleReportClick(report)}
              >
                {/* Media Content */}
                {report.videoUrl && report.videoUrl.trim() !== '' ? (
                  <div className="relative h-40 lg:h-48 overflow-hidden">
                    <video
                      src={report.videoUrl}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      autoPlay
                      controls={false}
                      onMouseEnter={(e) => e.currentTarget.play()}
                      onMouseLeave={(e) => e.currentTarget.pause()}
                    />
                    
                    {/* Media Overlay */}
                    <div 
                      className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
                      style={{
                        background: `linear-gradient(to top, ${getEmotionColor(report.emotion)}40, transparent)`
                      }}
                    />
                    
                    {/* Hot Badge */}
                    {report.isHot && (
                      <div 
                        className="absolute top-2 right-2 text-xs px-2 py-1 rounded-full animate-pulse"
                        style={{ 
                          backgroundColor: 'var(--hellmap-neon-orange)',
                          color: 'black'
                        }}
                      >
                        HOT
                      </div>
                    )}

                    {/* Video Play Indicator */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity"
                        style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                      >
                        <span className="text-white text-xl">▶</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative h-40 lg:h-48 overflow-hidden">
                    <ImageWithFallback
                      src={report.imageUrl}
                      alt={report.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      emotion={report.emotion}
                    />
                    
                    {/* Media Overlay - 이미지가 성공적으로 로드된 경우에만 */}
                    {report.imageUrl && report.imageUrl.trim() !== '' && (
                      <>
                        <div 
                          className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
                          style={{
                            background: `linear-gradient(to top, ${getEmotionColor(report.emotion)}40, transparent)`
                          }}
                        />
                        
                        {/* Hot Badge */}
                        {report.isHot && (
                          <div 
                            className="absolute top-2 right-2 text-xs px-2 py-1 rounded-full animate-pulse"
                            style={{ 
                              backgroundColor: 'var(--hellmap-neon-orange)',
                              color: 'black'
                            }}
                          >
                            HOT
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Card Content */}
                <div className="px-2 pt-0 pb-2 lg:px-3 lg:pt-0 lg:pb-3">
                  {/* Card Header */}
                  <div className="flex items-start gap-2 lg:gap-3 mb-2 lg:mb-3">
                    <div 
                      className="p-1.5 lg:p-2 rounded-lg shrink-0"
                      style={{ 
                        backgroundColor: `${getEmotionColor(report.emotion)}20`
                      }}
                    >
                      <IconComponent size={16} className="lg:w-5 lg:h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 
                          className="text-sm lg:text-lg font-medium leading-tight"
                          style={{ color: 'var(--hellmap-text-primary)' }}
                        >
                          {report.title}
                        </h3>

                        {isOwner && (
                          <span 
                            className="text-xs px-2 py-0.5 rounded-full border flex-shrink-0"
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
                      <div className="flex items-center gap-2 text-xs lg:text-sm">
                        <span style={{ color: 'var(--hellmap-text-muted)' }}>
                          👤 {report.author || '익명'}
                        </span>
                        <span style={{ color: 'var(--hellmap-text-muted)' }}>•</span>
                        <span style={{ color: 'var(--hellmap-text-muted)' }}>
                          📍 {formatLocation(report.location)}
                        </span>
                        <span style={{ color: 'var(--hellmap-text-muted)' }}>•</span>
                        <span style={{ color: 'var(--hellmap-text-muted)' }}>
                          ⏰ {report.timeAgo}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <p 
                    className="text-sm lg:text-base mb-3 lg:mb-4 leading-relaxed line-clamp-4 lg:line-clamp-5"
                    style={{ color: 'var(--hellmap-text-secondary)' }}
                  >
                    {report.content}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <button 
                      className={`flex items-center gap-2 text-xs lg:text-sm hover:scale-105 transition-transform px-3 py-1.5 rounded-full border ${
                        report.isLike ? 'border-red-500 bg-red-500/10' : 'border-gray-600'
                      }`}
                      style={{ 
                        color: report.isLike ? 'var(--hellmap-fear-color)' : 'var(--hellmap-text-muted)'
                      }}
                      onClick={(e) => handleLike(e, report)}
                    >
                      <span>{report.isLike ? '❤️' : '🤍'}</span>
                      <span className="font-medium">{report.likes}</span>
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}

          {/* 빈 상태 */}
          {!loading && pagedReports.length === 0 && (
            <div className="text-center py-8 lg:py-12">
              <div className="text-2xl lg:text-4xl mb-2 lg:mb-4">🤷‍♀️</div>
              <p style={{ color: 'var(--hellmap-text-muted)' }}>
                해당 감정의 제보가 없습니다.
              </p>
            </div>
          )}
          
          {/* 무한 스크롤 로딩 */}
          {hasMore && (
            <div className="text-center py-4 lg:py-6">
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2" style={{ borderColor: 'var(--hellmap-neon-blue)' }} />
                <span style={{ color: 'var(--hellmap-neon-blue)' }}>
                  더 많은 제보 불러오는 중... ({pagedReports.length}/{filteredReports.length})
                </span>
              </div>
            </div>
          )}

          {/* 모든 데이터 로딩 완료 */}
          {!hasMore && filteredReports.length > 0 && pagedReports.length >= PAGE_SIZE && (
            <div className="text-center py-4 lg:py-6">
              <span style={{ color: 'var(--hellmap-text-muted)' }}>
                ✅ 모든 제보를 불러왔습니다. (총 {filteredReports.length}개)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onEdit={handleEditFromModal}
          onDelete={handleDeleteFromModal}
          userNickname={userNickname}
        />
      )}
    </div>
  );
}