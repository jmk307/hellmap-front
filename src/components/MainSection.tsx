import { useState, useEffect } from 'react';
import { MapSection } from './MapSection';
import { ReportFeed } from './ReportFeed';
import { ReportDetailModal } from './ReportDetailModal';
import { Report } from '../../types/report';

interface MainSectionProps {
  activeFilter: string;
  activeLocationFilter?: string;  // 지역 필터 추가
  onLocationFilterChange?: (location: string) => void;  // 지역 필터 변경 핸들러
  userNickname?: string;
  onEditReport?: (report: Report) => void;
  onDeleteReport?: (report: Report) => void;
  onLikeReport?: (reportId: string) => void;
  reports?: Report[];
}

export function MainSection({ 
  activeFilter, 
  activeLocationFilter = 'all',
  onLocationFilterChange,
  userNickname, 
  onEditReport,
  onDeleteReport,
  onLikeReport,
  reports
}: MainSectionProps) {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const handleReportClick = (report: Report) => {
    setSelectedReport(report);
  };

  const handleEditFromModal = (report: Report) => {
    setSelectedReport(null); // 먼저 모달을 닫고
    if (onEditReport) {
      onEditReport(report);
    }
  };

  const handleDeleteFromModal = async (report: Report) => {
    setSelectedReport(null); // 먼저 모달을 닫고
    if (onDeleteReport) {
      await onDeleteReport(report);
    }
  };

  // 제보 목록이 변경될 때마다 선택된 제보도 업데이트
  useEffect(() => {
    if (selectedReport) {
      const updatedReport = reports?.find(r => r.reportId === selectedReport.reportId);
      if (!updatedReport) {
        // 선택된 제보가 목록에서 없어졌다면 모달 닫기
        setSelectedReport(null);
      }
    }
  }, [reports, selectedReport]);

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
      {/* Map Section - Full width on mobile, left side on desktop */}
      <div className="w-full lg:flex-1 h-1/2 lg:h-full min-w-0">
        <MapSection 
          activeFilter={activeFilter} 
          reports={reports}
          onReportClick={handleReportClick}
        />
      </div>
      
      {/* Feed Section - Full width on mobile, right side on desktop */}
      <div 
        className="w-full lg:w-[420px] h-1/2 lg:h-full border-t lg:border-t-0 lg:border-l flex flex-col overflow-y-auto" 
        style={{ borderColor: 'var(--hellmap-border)' }}
      >
        <ReportFeed 
          activeFilter={activeFilter}
          activeLocationFilter={activeLocationFilter}
          onLocationFilterChange={onLocationFilterChange}
          userNickname={userNickname}
          onEditReport={onEditReport}
          onDeleteReport={onDeleteReport}
          onLikeReport={onLikeReport}
          reports={reports}
        />
      </div>

      {/* Report Detail Modal from Map */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onEdit={handleEditFromModal}
          onDelete={handleDeleteFromModal}
          onLike={onLikeReport}
          userNickname={userNickname}
        />
      )}
    </div>
  );
}