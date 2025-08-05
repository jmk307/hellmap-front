import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';


import { FearIcon, AngerIcon, LaughIcon } from './icons/EmotionIcons';
import { LocationPicker } from './LocationPicker';
import { Emotion } from '../../types/report';
import { toast } from 'sonner'; // Added toast import

interface MediaFile {
  id: string;
  file: File | null;
  url: string;
  type: 'image' | 'video';
  preview?: string;
  isExisting?: boolean; // 기존 파일인지 여부
}



interface ReportFormProps {
  onSubmit: (reportData: any) => void;
  onCancel: () => void;
  editData?: any; // 수정 시 기존 데이터
  userNickname: string;
}

export function ReportForm({ onSubmit, onCancel, editData, userNickname }: ReportFormProps) {
  const [emotion, setEmotion] = useState<Emotion>(editData?.emotion || 'SCARY');
  const [title, setTitle] = useState(editData?.title || '');
  const [content, setContent] = useState(editData?.content || '');
  const [location, setLocation] = useState(editData?.location || '');
  const [locationCoordinates, setLocationCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedRegionCode, setSelectedRegionCode] = useState<number | undefined>(editData?.regionCode);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>(() => {
    // 수정 시 기존 미디어 파일 정보 설정
    if (editData?.imageUrl) {
      return [{
        id: 'existing-image',
        file: null,
        url: editData.imageUrl,
        type: 'image',
        isExisting: true
      }];
    }
    if (editData?.videoUrl) {
      return [{
        id: 'existing-video',
        file: null,
        url: editData.videoUrl,
        type: 'video',
        isExisting: true
      }];
    }
    return [];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // 검색 관련 상태 추가

  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 감정 선택 옵션
  const emotionOptions = [
    { value: 'SCARY' as Emotion, label: '개무섭', icon: FearIcon, color: 'var(--hellmap-fear-color)' },
    { value: 'ANNOYING' as Emotion, label: '개짜증', icon: AngerIcon, color: 'var(--hellmap-anger-color)' },
    { value: 'FUNNY' as Emotion, label: '개웃김', icon: LaughIcon, color: 'var(--hellmap-laugh-color)' }
  ];

  const selectedEmotion = emotionOptions.find(e => e.value === emotion)!;

  // 파일 업로드 처리 (한 장만 허용)
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB
    
    if (!isImage && !isVideo) {
      alert('이미지 또는 동영상 파일만 업로드 가능합니다.');
      return;
    }

    if (!isValidSize) {
      alert('파일 크기는 50MB 이하만 가능합니다.');
      return;
    }

    // 기존 파일 URL 해제
    mediaFiles.forEach(media => {
      URL.revokeObjectURL(media.url);
    });

    const mediaFile: MediaFile = {
      id: Date.now().toString(),
      file,
      url: URL.createObjectURL(file),
      type: isImage ? 'image' : 'video'
    };

    setMediaFiles([mediaFile]); // 배열에 하나만 저장
  };

  // 파일 삭제 (한 장만 허용하므로 전체 삭제)
  const removeFile = () => {
    mediaFiles.forEach(media => {
      URL.revokeObjectURL(media.url);
    });
    setMediaFiles([]);
  };

  // 지도에서 위치 선택 - 개선된 버전
  const handleLocationSelect = (selectedAddress: string, coordinates: { lat: number; lng: number }, regionCode?: number) => {

    
    setLocation(selectedAddress);
    setLocationCoordinates(coordinates);
    setSelectedRegionCode(regionCode);

    // 위치 선택 시 오류 제거
    if (errors.location) {
      setErrors(prev => ({ ...prev, location: '' }));
    }
  };

  // 폼 유효성 검사
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // 제목 검사
    if (!title.trim()) {
      newErrors.title = '제목을 입력해주세요';
    } else if (title.length < 5) {
      newErrors.title = '제목은 5글자 이상 입력해주세요';
    } else if (title.length > 100) {
      newErrors.title = '제목은 100글자 이하로 입력해주세요';
    }

    // 내용 검사
    if (!content.trim()) {
      newErrors.content = '내용을 입력해주세요';
    } else if (content.length < 10) {
      newErrors.content = '내용은 10글자 이상 입력해주세요';
    } else if (content.length > 1000) {
      newErrors.content = '내용은 1000글자 이하로 입력해주세요';
    }

    // 위치 검사
    if (!location.trim()) {
      newErrors.location = '위치를 선택해주세요';
    } else if (location === '주소를 찾을 수 없는 위치') {
      newErrors.location = '올바른 위치를 선택해주세요';
    }

    // 좌표 검사
    if (!locationCoordinates) {
      newErrors.location = '위치를 다시 선택해주세요';
    } else {
      const { lat, lng } = locationCoordinates;
      // 한국 영역 좌표 검사 (대략적인 범위)
      if (lat < 33 || lat > 38.5 || lng < 125 || lng > 132) {
        newErrors.location = '한국 내의 위치를 선택해주세요';
      }
    }

    // 미디어 파일 검사 (선택사항이므로 있는 경우만 검사)
    if (mediaFiles.length > 0 && !mediaFiles[0].isExisting) {
      const file = mediaFiles[0].file;
      if (!file) {
        newErrors.media = '파일을 다시 선택해주세요';
      } else {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        const maxSize = 50 * 1024 * 1024; // 50MB

        if (!isImage && !isVideo) {
          newErrors.media = '이미지 또는 동영상 파일만 업로드 가능합니다';
        } else if (file.size > maxSize) {
          newErrors.media = '파일 크기는 50MB 이하만 가능합니다';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 제출 처리
  const handleSubmit = async () => {
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // 제목에 감정 접두어 추가 (없는 경우에만)
      const emotionPrefix = selectedEmotion.label.split(')')[0]; // 감정 라벨에서 접두어 추출
      const titleWithPrefix = title.startsWith(emotionPrefix) ? title : `${emotionPrefix} ${title}`;

      // 리포트 데이터를 JSON으로 변환
      const reportRequestDto = {
        emotion: emotion,
        title: titleWithPrefix,
        content,
        address: location,
        regionCode: selectedRegionCode,
        latitude: locationCoordinates?.lat || 0,
        longitude: locationCoordinates?.lng || 0
      };

      // FormData 생성
      const formData = new FormData();

      // 리포트 데이터를 JSON으로 변환하여 추가
      formData.append(
        editData ? 'reportUpdateRequestDto' : 'reportRequestDto',
        new Blob([JSON.stringify(reportRequestDto)], {
          type: 'application/json'
        })
      );

      // 미디어 파일 처리
      if (mediaFiles.length > 0) {
        if (mediaFiles[0].isExisting) {
          // 기존 파일을 유지하는 경우
          formData.append('keepExistingMedia', 'true');
        } else if (mediaFiles[0].file) {
          // 새로운 파일이 있는 경우
          formData.append('imageFile', mediaFiles[0].file);
        }
      } else {
        // 파일을 삭제하는 경우
        formData.append('keepExistingMedia', 'false');
      }

      // API 호출 (수정 또는 생성)
      const url = editData 
        ? `https://www.api-hellmap.shop/api/reports/${editData.reportId}` 
        : 'https://www.api-hellmap.shop/api/reports';
      
      const response = await fetch(url, {
        method: editData ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || (editData ? '제보 수정에 실패했습니다.' : '제보 등록에 실패했습니다.'));
      }

      const responseData = await response.json();


      onSubmit(responseData);
      
      // 성공 메시지 표시
      toast.success(editData 
        ? '제보가 성공적으로 수정되었습니다! 🎉' 
        : '새로운 제보가 등록되었습니다! 🎉', {
        description: editData
          ? '수정하신 내용이 실시간으로 반영되었습니다.'
          : '여러분의 제보가 다른 사용자들에게 도움이 될 거예요!'
      });
    } catch (error) {
      console.error(editData ? '제보 수정 실패:' : '제보 제출 실패:', error);
      alert(error instanceof Error ? error.message : `제보 ${editData ? '수정' : '제출'}에 실패했습니다. 다시 시도해주세요.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 backdrop-blur-md transition-all duration-300 ease-out"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      <div 
        className="w-full max-w-2xl h-[95vh] sm:h-[90vh] flex flex-col transition-all duration-300 ease-out"
        style={{
          animation: 'slideInUp 0.3s ease-out'
        }}
      >
        <Card 
          className="border hellmap-card-glow flex flex-col h-full shadow-2xl"
          style={{ 
            backgroundColor: 'var(--hellmap-card-bg)',
            borderColor: selectedEmotion.color,
            boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(${selectedEmotion.color === 'var(--hellmap-fear-color)' ? '220, 38, 127' : selectedEmotion.color === 'var(--hellmap-anger-color)' ? '249, 115, 22' : '34, 197, 94'}, 0.3)`
          }}
        >
          {/* Header */}
          <div 
            className="p-3 sm:p-4 lg:p-5 border-b flex-shrink-0"
            style={{ borderColor: 'var(--hellmap-border)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div 
                  className="p-1.5 sm:p-2 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: `${selectedEmotion.color}20` }}
                >
                  <selectedEmotion.icon size={20} />
                </div>
                <div className="min-w-0">
                  <h2 
                    className="text-lg sm:text-xl hellmap-neon-text-shadow truncate"
                    style={{ color: selectedEmotion.color }}
                  >
                    {editData ? '제보 수정하기' : '새 제보 작성하기'}
                  </h2>
                  <p 
                    className="text-xs sm:text-sm truncate"
                    style={{ color: 'var(--hellmap-text-muted)' }}
                  >
                    {userNickname}님의 지옥 체험을 공유해주세요
                  </p>
                </div>
              </div>
              
              <Button
                onClick={onCancel}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border hover:scale-110 transition-transform flex-shrink-0"
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

          {/* Form Content */}
          <div className="flex-1 overflow-hidden">
            <div 
              className="h-full overflow-y-auto p-3 sm:p-4 lg:p-5 hellmap-scroll"
              style={{
                '--scrollbar-color': selectedEmotion.color
              } as React.CSSProperties}
            >
              <div className="space-y-4 sm:space-y-5">
                {/* Emotion Selection */}
                <div>
                  <label 
                    className="block text-sm mb-2 sm:mb-3"
                    style={{ color: 'var(--hellmap-text-primary)' }}
                  >
                    감정 선택
                  </label>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {emotionOptions.map((emotionOption) => {
                      const IconComponent = emotionOption.icon;
                      return (
                        <Button
                          key={emotionOption.value}
                          onClick={() => setEmotion(emotionOption.value as Emotion)}
                          className={`min-h-[50px] sm:min-h-[60px] p-2.5 sm:p-3 rounded-lg border-2 transition-all duration-300 ${
                            emotion === emotionOption.value ? 'scale-105 hellmap-neon-glow' : 'hover:scale-105'
                          }`}
                          style={{
                            backgroundColor: emotion === emotionOption.value 
                              ? `${emotionOption.color}20` 
                              : 'var(--hellmap-darker-bg)',
                            borderColor: emotionOption.color,
                            color: emotion === emotionOption.value 
                              ? emotionOption.color 
                              : 'var(--hellmap-text-secondary)'
                          }}
                        >
                          <div className="flex flex-col items-center justify-center gap-1.5 sm:gap-2 h-full">
                            <IconComponent size={20} />
                            <span className="text-xs sm:text-sm font-medium whitespace-nowrap">{emotionOption.label}</span>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label 
                    className="block text-sm mb-2"
                    style={{ color: 'var(--hellmap-text-primary)' }}
                  >
                    제목 *
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={`예: ${selectedEmotion.label.split(')')[0]} 오늘 겪은 일`}
                    className={`w-full p-2.5 sm:p-3 rounded-lg border-2 transition-all text-sm sm:text-base ${
                      errors.title ? 'border-red-500' : 'focus:border-blue-500'
                    }`}
                    style={{
                      backgroundColor: 'var(--hellmap-darker-bg)',
                      borderColor: errors.title ? '#ef4444' : 'var(--hellmap-border)',
                      color: 'var(--hellmap-text-primary)'
                    }}
                  />
                  {errors.title && (
                    <p className="text-red-400 text-xs sm:text-sm mt-1">{errors.title}</p>
                  )}
                  <div 
                    className="text-xs mt-1 text-right"
                    style={{ color: 'var(--hellmap-text-muted)' }}
                  >
                    {title.length}/100
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label 
                    className="block text-sm mb-2"
                    style={{ color: 'var(--hellmap-text-primary)' }}
                  >
                    위치 *
                  </label>
                  
                  <LocationPicker
                    onLocationSelect={handleLocationSelect}
                    initialLocation={location}
                    className="mb-2"
                  />

                  {location && locationCoordinates && (
                    <div 
                      className="p-2 rounded-lg text-xs"
                      style={{ 
                        backgroundColor: 'var(--hellmap-darker-bg)',
                        color: 'var(--hellmap-text-muted)'
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span>📍</span>
                        <span className="flex-1">{location}</span>
                      </div>
                    </div>
                  )}

                  {errors.location && (
                    <p className="text-red-400 text-xs sm:text-sm mt-1">{errors.location}</p>
                  )}
                </div>

                {/* Content */}
                <div>
                  <label 
                    className="block text-sm mb-2"
                    style={{ color: 'var(--hellmap-text-primary)' }}
                  >
                    상세 내용 *
                  </label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="무슨 일이 있었는지 자세히 알려주세요..."
                    rows={5}
                    className={`w-full p-2.5 sm:p-3 rounded-lg border-2 transition-all resize-none text-sm sm:text-base ${
                      errors.content ? 'border-red-500' : 'focus:border-blue-500'
                    }`}
                    style={{
                      backgroundColor: 'var(--hellmap-darker-bg)',
                      borderColor: errors.content ? '#ef4444' : 'var(--hellmap-border)',
                      color: 'var(--hellmap-text-primary)'
                    }}
                  />
                  {errors.content && (
                    <p className="text-red-400 text-xs sm:text-sm mt-1">{errors.content}</p>
                  )}
                  <div 
                    className="text-xs mt-1 text-right"
                    style={{ color: 'var(--hellmap-text-muted)' }}
                  >
                    {content.length}/1000
                  </div>
                </div>

                {/* Media Upload */}
                <div>
                  <label 
                    className="block text-sm mb-2 sm:mb-3"
                    style={{ color: 'var(--hellmap-text-primary)' }}
                  >
                    사진/동영상 (1장만 선택 가능)
                  </label>
                  
                  {/* Upload Button - 파일이 없을 때만 표시 */}
                  {mediaFiles.length === 0 && (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full min-h-[80px] sm:min-h-[90px] p-4 sm:p-6 border-2 border-dashed rounded-xl transition-all hover:scale-[1.02] hover:border-opacity-80 cursor-pointer group"
                      style={{
                        backgroundColor: 'var(--hellmap-darker-bg)',
                        borderColor: 'var(--hellmap-border)',
                      }}
                    >
                      <div className="flex flex-col items-center justify-center gap-2 sm:gap-3 h-full">
                        <div 
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all group-hover:scale-110"
                          style={{ backgroundColor: 'var(--hellmap-border)' }}
                        >
                          <span className="text-lg sm:text-xl">📷</span>
                        </div>
                        <div className="text-center">
                          <div 
                            className="text-sm sm:text-base font-medium mb-1"
                            style={{ color: 'var(--hellmap-text-primary)' }}
                          >
                            클릭해서 사진/동영상 업로드
                          </div>
                          <div 
                            className="text-xs"
                            style={{ color: 'var(--hellmap-text-muted)' }}
                          >
                            이미지 또는 동영상 파일 (최대 50MB)
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {/* Media Preview - 파일이 있을 때만 표시 */}
                  {mediaFiles.length > 0 && (
                    <div>
                      {(() => {
                        const media = mediaFiles[0]; // 첫 번째(유일한) 파일
                        return (
                          <div 
                            className="relative rounded-xl overflow-hidden border-2 group"
                            style={{
                              backgroundColor: 'var(--hellmap-darker-bg)',
                              borderColor: selectedEmotion.color
                            }}
                          >
                            {/* Media Display */}
                            <div className="relative aspect-video w-full bg-gray-900">
                              {media.type === 'image' ? (
                                <img
                                  src={media.url}
                                  alt="업로드된 이미지"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <video
                                  src={media.url}
                                  className="w-full h-full object-cover"
                                  controls
                                  muted
                                  loop
                                  autoPlay
                                />
                              )}
                              
                              {/* Overlay Controls */}
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <div className="flex gap-3">
                                  <Button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 rounded-lg border transition-all hover:scale-105"
                                    style={{
                                      backgroundColor: selectedEmotion.color,
                                      borderColor: selectedEmotion.color,
                                      color: 'black'
                                    }}
                                  >
                                    <span className="text-sm">📷 교체</span>
                                  </Button>
                                  
                                  <Button
                                    onClick={removeFile}
                                    className="px-4 py-2 rounded-lg border transition-all hover:scale-105"
                                    style={{
                                      backgroundColor: 'var(--hellmap-card-bg)',
                                      borderColor: '#ef4444',
                                      color: '#ef4444'
                                    }}
                                  >
                                    <span className="text-sm">🗑️ 삭제</span>
                                  </Button>
                                </div>
                              </div>
                            </div>
                            
                            {/* File Info */}
                            <div 
                              className="p-3 sm:p-4 border-t"
                              style={{ borderColor: 'var(--hellmap-border)' }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <div 
                                    className="text-sm font-medium truncate"
                                    style={{ color: 'var(--hellmap-text-primary)' }}
                                  >
                                    {media.file ? media.file.name : '기존 파일'}
                                  </div>
                                  <div 
                                    className="text-xs mt-1"
                                    style={{ color: 'var(--hellmap-text-muted)' }}
                                  >
                                    {media.type === 'image' ? '📷 이미지' : '🎬 동영상'} • {(media.file ? (media.file.size / 1024 / 1024).toFixed(1) : '0.0')}MB
                                  </div>
                                </div>
                                
                                <div 
                                  className="px-2 py-1 rounded-full text-xs"
                                  style={{ 
                                    backgroundColor: `${selectedEmotion.color}20`,
                                    color: selectedEmotion.color 
                                  }}
                                >
                                  업로드 완료
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div 
            className="p-3 sm:p-4 lg:p-5 border-t flex-shrink-0"
            style={{ borderColor: 'var(--hellmap-border)' }}
          >
            <div className="flex gap-2 sm:gap-3">
              <Button
                onClick={onCancel}
                className="flex-1 py-2.5 sm:py-3 rounded-lg border transition-all hover:scale-105 text-sm sm:text-base"
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
                disabled={isSubmitting}
                className={`flex-1 py-2.5 sm:py-3 rounded-lg border-2 transition-all text-sm sm:text-base ${
                  !isSubmitting ? 'hover:scale-105 active:scale-95' : ''
                }`}
                style={{
                  backgroundColor: !isSubmitting ? selectedEmotion.color : 'var(--hellmap-card-bg)',
                  borderColor: selectedEmotion.color,
                  color: !isSubmitting ? 'black' : 'var(--hellmap-text-muted)',
                  opacity: !isSubmitting ? 1 : 0.5
                }}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div 
                      className="w-3 h-3 sm:w-4 sm:h-4 rounded-full animate-spin border-2 border-transparent border-t-black"
                    />
                    <span>{editData ? '수정 중...' : '제보 중...'}</span>
                  </div>
                ) : (
                  <span>{editData ? '수정하기' : '제보하기'}</span>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}