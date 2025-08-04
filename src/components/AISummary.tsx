import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { FearIcon, AngerIcon, LaughIcon, FireIcon } from './icons/EmotionIcons';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Report } from '../../types/report';

interface RegionSummary {
  region: string;
  totalReports: number;
  emotionStats: {
    SCARY: number;
    ANNOYING: number;
    FUNNY: number;
  };
  dominantEmotion: 'SCARY' | 'ANNOYING' | 'FUNNY';
  keywords: string[];
  aiImageUrl?: string;
  summary: string;
  hellLevel: number; // 1-5 지옥도
}

interface AISummaryProps {
  reports: Report[];
  onClose: () => void;
}

export function AISummary({ reports, onClose }: AISummaryProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [regionSummaries, setRegionSummaries] = useState<RegionSummary[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<RegionSummary | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  // 이미지 전체화면 모달 상태
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  
  // 선택된 지역으로 스크롤하는 ref
  const selectedRegionRef = useRef<HTMLDivElement>(null);

  // ESC 키로 전체화면 모달 닫기
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && fullscreenImage) {
        setFullscreenImage(null);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [fullscreenImage]);

  // 지역 선택시 스크롤 처리
  useEffect(() => {
    if (selectedRegion && selectedRegionRef.current) {
      selectedRegionRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }, [selectedRegion]);

  // 서울시 25개 구
  const seoulDistricts = [
    '강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구',
    '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구',
    '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'
  ];

  // 지역명을 구로 매핑
  const mapLocationToDistrict = (location: string): string => {
    for (const district of seoulDistricts) {
      if (location.includes(district) || location.includes(district.replace('구', ''))) {
        return district;
      }
    }
    
    // 역명이나 동네명을 구로 매핑 (간단한 예시)
    const locationMapping: Record<string, string> = {
      '강남역': '강남구', '홍대입구': '마포구', '신촌': '서대문구',
      '이태원': '용산구', '종로구': '종로구', '명동': '중구',
      '서초구': '서초구', '송파구': '송파구', '관악구': '관악구',
      '영등포구': '영등포구', '용산구': '용산구', '마포구': '마포구'
    };
    
    for (const [area, district] of Object.entries(locationMapping)) {
      if (location.includes(area)) {
        return district;
      }
    }
    
    return '기타지역';
  };

  // 키워드 추출
  const extractKeywords = (reports: Report[]): string[] => {
    const commonWords = ['개무섭', '개짜증', '개웃김', '그냥', '정말', '너무', '완전', '진짜', '아니', '이거', '그거', '저거', '이런', '그런', '저런'];
    
    const allText = reports.map(r => r.title + ' ' + r.content).join(' ');
    const words = allText.match(/[가-힣]{2,}/g) || [];
    
    const wordCount: Record<string, number> = {};
    words.forEach(word => {
      if (!commonWords.includes(word) && word.length >= 2) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });
    
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  };

  // AI 텍스트 요약 함수 추가
  const summarizeReports = async (reports: Report[]): Promise<string> => {
    if (reports.length === 0) return "제보가 없습니다.";
    
    // 모든 제보 내용을 합치기
    const allContent = reports.map(r => r.content).join(' ');
    
    // 너무 길면 자르기 (BART 모델 제한)
    const maxLength = 1000;
    const truncatedContent = allContent.length > maxLength 
      ? allContent.substring(0, maxLength) + "..." 
      : allContent;
    
    try {
      // Hugging Face 무료 요약 API 사용
      const response = await fetch(
        "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
        {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            inputs: truncatedContent,
            parameters: {
              max_length: 100,
              min_length: 30,
              do_sample: false
            }
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result?.[0]?.summary_text) {

          return result[0].summary_text;
        }
      }
      
      // API 실패시 키워드 기반 fallback
      
      return createKeywordSummary(reports);
      
    } catch (error) {
      console.error('AI 텍스트 요약 중 오류:', error);
      return createKeywordSummary(reports);
    }
  };

  // 키워드 기반 fallback 요약
  const createKeywordSummary = (reports: Report[]): string => {
    const keywords = extractKeywords(reports);
    const topKeywords = keywords.slice(0, 3);
    
    if (topKeywords.length === 0) {
      return `${reports.length}개의 제보가 접수되었습니다.`;
    }
    
    return `주요 이슈: ${topKeywords.join(', ')} 등 ${reports.length}개 제보 접수`;
  };

  // Mock 이미지 목록
  const mockImages = {
    SCARY: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&h=400&fit=crop&crop=center',
    ANNOYING: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=600&h=400&fit=crop&crop=center',
    FUNNY: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=400&fit=crop&crop=center'
  };

     const generateAIImage = async (summary: RegionSummary): Promise<string> => {
     try {
       // 해당 지역의 제보들 가져오기
       const regionReports = reports.filter(report => 
         mapLocationToDistrict(report.location) === summary.region
       );
       
       // 좋아요 수 기준으로 상위 3개 제보 선택
       const topReports = regionReports
         .sort((a, b) => (b.likes || 0) - (a.likes || 0))
         .slice(0, 3);
       
       // 제보가 3개 미만인 경우 처리
       let promptParts = [];
       
       if (topReports.length >= 1) {
         const report1 = topReports[0];
         const action1 = extractAction(report1.content);
                   const emotion1 = extractEmotion(report1.emotion);
         promptParts.push(`A person is ${action1}, ${emotion1}.`);
       }
       
       if (topReports.length >= 2) {
         const report2 = topReports[1];
         const action2 = extractAction(report2.content);
                   const situation2 = extractSituation();
         promptParts.push(`Another person is ${action2}, ${situation2}.`);
       }
       
       if (topReports.length >= 3) {
          const reaction3 = extractReaction();
         promptParts.push(`Meanwhile, ${reaction3}.`);
       }
       
       // 제보가 부족한 경우 기본 문구로 채우기
       while (promptParts.length < 3) {
         if (promptParts.length === 0) {
           promptParts.push("A person is walking down the street, looking confused and lost.");
         } else if (promptParts.length === 1) {
           promptParts.push("Another person is waiting at a bus stop, checking their phone impatiently.");
         } else {
           promptParts.push("Meanwhile, the street is bustling with everyday urban life, people going about their business.");
         }
       }
       
       // 최종 프롬프트 생성
       const comprehensivePrompt = `
         ${promptParts.join('  ')}  
         Cartoon style, exaggerated facial expressions, hellmap-style emotional chaos, emotion-focused, Korean street vibe.
       `.trim().replace(/\s+/g, ' ');

 
      
      // Pollinations.ai API (100% 무료, 토큰 불필요)
      let imageUrl: string;
      try {
        imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(comprehensivePrompt).replace(/%20/g, '+')}?width=512&height=512&model=flux&seed=${Math.floor(Math.random() * 10000)}`;
      } catch (error) {
        console.error('URL 인코딩 실패, 기본 이미지 사용:', error);
        return mockImages[summary.dominantEmotion as keyof typeof mockImages] || mockImages.SCARY;
      }
      
      // 이미지가 실제로 로드되는지 확인
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
  
          resolve(imageUrl);
        };
        img.onerror = () => {
   
           resolve(mockImages[summary.dominantEmotion as keyof typeof mockImages] || mockImages.SCARY);
         };
        img.src = imageUrl;
      });
      
          } catch (error) {
       console.error('AI 이미지 생성 중 오류:', error);
       return mockImages[summary.dominantEmotion as keyof typeof mockImages] || mockImages.SCARY;
     }
  };

  // 제보 내용에서 행동 추출
  const extractAction = (content: string): string => {
    // 간단한 키워드 기반 행동 추출
    const actions = [
      { keywords: ['앉아', '탔는데', '타고'], action: 'sitting in a car' },
      { keywords: ['걸어', '가는데', '지나가'], action: 'walking down the street' },
      { keywords: ['넘어', '떨어', '미끄러'], action: 'tripping and falling' },
      { keywords: ['기다', '서있', '줄서'], action: 'waiting in line' },
      { keywords: ['먹고', '시켰', '주문'], action: 'eating at a restaurant' },
      { keywords: ['공부', '도서관', '책'], action: 'studying at a library' },
      { keywords: ['일하', '알바', '직장'], action: 'working at their job' }
    ];
    
    for (const {keywords, action} of actions) {
      if (keywords.some(keyword => content.includes(keyword))) {
        return action;
      }
    }
    
    return 'going about their daily routine';
  };

  // 제보 내용에서 감정 묘사 추출
  const extractEmotion = (emotion: string): string => {
    const emotionDescriptions = {
      'SCARY': [
        'terrified as strange sounds echo around them',
        'frightened by mysterious shadows and flickering lights',
        'scared and trembling from an unexplainable experience'
      ],
      'ANNOYING': [
        'frustrated and angry at the unfair treatment',
        'irritated by the rude behavior of others',
        'annoyed and complaining about the poor service'
      ],
      'FUNNY': [
        'laughing at the absurd situation unfolding',
        'amused by the ridiculous misunderstanding',
        'giggling at the unexpected comedy of errors'
      ]
    };
    
    const descriptions = emotionDescriptions[emotion as keyof typeof emotionDescriptions] || emotionDescriptions['SCARY'];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  };

  // 제보 내용에서 상황과 주변 반응 추출
  const extractSituation = (): string => {
    const situations = [
      'struggling while people awkwardly watch',
      'dealing with a frustrating situation as others ignore them',
      'experiencing something bizarre while bystanders react',
      'facing an unexpected challenge in public',
      'caught in an embarrassing moment with witnesses around'
    ];
    
    return situations[Math.floor(Math.random() * situations.length)];
  };

  // 제보 내용에서 환경 또는 사람들 반응 추출
  const extractReaction = (): string => {
    const reactions = [
      'everyone sweating and fanning themselves in the heat',
      'people pointing and whispering about what they witnessed',
      'the crowd either laughing or looking away uncomfortably',
      'bystanders taking photos or videos of the scene',
      'others shaking their heads in disbelief or amusement'
    ];
    
    return reactions[Math.floor(Math.random() * reactions.length)];
  };

  // 지역별 분석
  const analyzeRegions = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    // 지역별 제보 그룹핑
    const regionGroups: Record<string, Report[]> = {};
    
    reports.forEach(report => {
      const district = mapLocationToDistrict(report.location);
      if (!regionGroups[district]) {
        regionGroups[district] = [];
      }
      regionGroups[district].push(report);
    });

    const summaries: RegionSummary[] = [];

    // 진행률 업데이트
    const totalRegions = Object.keys(regionGroups).length;
    let processedRegions = 0;

    for (const [region, regionReports] of Object.entries(regionGroups)) {
      if (regionReports.length === 0) continue;

      const emotionStats = {
        SCARY: regionReports.filter(r => r.emotion === 'SCARY').length,
        ANNOYING: regionReports.filter(r => r.emotion === 'ANNOYING').length,
        FUNNY: regionReports.filter(r => r.emotion === 'FUNNY').length,
      };

      const dominantEmotion = Object.entries(emotionStats).reduce((a, b) => 
        emotionStats[a[0] as keyof typeof emotionStats] > emotionStats[b[0] as keyof typeof emotionStats] ? a : b
      )[0] as 'SCARY' | 'ANNOYING' | 'FUNNY';

      const keywords = extractKeywords(regionReports);
      
      const hellLevel = Math.min(5, Math.max(1, 
        Math.round((emotionStats.SCARY * 1.5 + emotionStats.ANNOYING * 1.2 + emotionStats.FUNNY * 0.5) / regionReports.length * 2)
      ));

      // AI로 실제 제보 내용 요약
      const aiSummary = await summarizeReports(regionReports);
      
      const summary: RegionSummary = {
        region,
        totalReports: regionReports.length,
        emotionStats,
        dominantEmotion,
        keywords,
        summary: aiSummary,
        hellLevel
      };

      summaries.push(summary);

      processedRegions++;
      setAnalysisProgress((processedRegions / totalRegions) * 100);
      
      // 분석 시간 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // 제보 수 기준으로 정렬
    summaries.sort((a, b) => b.totalReports - a.totalReports);
    
    setRegionSummaries(summaries);
    setIsAnalyzing(false);
  };

  // AI 이미지 생성 처리
  const handleGenerateImage = async (summary: RegionSummary) => {
    setIsGeneratingImage(true);
    
    try {
      const imageUrl = await generateAIImage(summary);
      
      setRegionSummaries(prev => 
        prev.map(s => 
          s.region === summary.region 
            ? { ...s, aiImageUrl: imageUrl }
            : s
        )
      );
      
      if (selectedRegion?.region === summary.region) {
        setSelectedRegion(prev => prev ? { ...prev, aiImageUrl: imageUrl } : null);
      }
    } catch (error) {
      console.error('AI 이미지 생성 실패:', error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case 'SCARY': return 'var(--hellmap-fear-color)';
      case 'ANNOYING': return 'var(--hellmap-anger-color)';
      case 'FUNNY': return 'var(--hellmap-laugh-color)';
      default: return 'var(--hellmap-neon-blue)';
    }
  };

  // 지옥도별 색상
  const getHellLevelColor = (level: number) => {
    const colors = [
      'var(--hellmap-neon-green)',    // 1
      'var(--hellmap-neon-blue)',     // 2  
      'var(--hellmap-neon-orange)',   // 3
      'var(--hellmap-anger-color)',   // 4
      'var(--hellmap-fear-color)'     // 5
    ];
    return colors[level - 1] || colors[0];
  };

  useEffect(() => {
    analyzeRegions();
  }, []);

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 lg:p-4 backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
    >
      <div className="w-full max-w-4xl lg:max-w-6xl h-[85vh] lg:h-[90vh] flex flex-col">
        <Card 
          className="flex-1 border hellmap-card-glow"
          style={{ 
            backgroundColor: 'var(--hellmap-card-bg)',
            borderColor: 'var(--hellmap-neon-green)'
          }}
        >
          {/* Header */}
          <div 
            className="p-3 lg:p-6 border-b"
            style={{ borderColor: 'var(--hellmap-border)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: 'var(--hellmap-neon-green)20' }}
                >
                  <FireIcon size={32} />
                </div>
                <div>
                  <h2 
                    className="text-lg lg:text-2xl hellmap-neon-text-shadow"
                    style={{ color: 'var(--hellmap-neon-green)' }}
                  >
                    🤖 AI 지역 분석 리포트
                  </h2>
                  <p 
                    className="text-sm"
                    style={{ color: 'var(--hellmap-text-muted)' }}
                  >
                    서울시 구별 감정 지도 & AI 이미지 생성
                  </p>
                </div>
              </div>
              
              <Button
                onClick={onClose}
                className="w-10 h-10 rounded-full border hover:scale-110 transition-transform"
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
            className="flex-1 flex min-h-0"
            style={{ height: 'calc(90vh - 80px)' }}
          >
            {/* Left Panel - Region List */}
            <div 
              className="w-2/5 lg:w-1/3 border-r min-h-0"
              style={{ borderColor: 'var(--hellmap-border)' }}
            >
              {isAnalyzing ? (
                <div className="p-3 lg:p-6">
                  <div className="text-center">
                    <div className="mb-4">
                      <div 
                        className="w-16 h-16 mx-auto rounded-full animate-spin border-4 border-transparent"
                        style={{ 
                          borderTopColor: 'var(--hellmap-neon-green)',
                          borderRightColor: 'var(--hellmap-neon-blue)'
                        }}
                      />
                    </div>
                    <h3 
                      className="text-lg mb-2"
                      style={{ color: 'var(--hellmap-text-primary)' }}
                    >
                      AI 분석 중...
                    </h3>
                    <p 
                      className="text-sm mb-4"
                      style={{ color: 'var(--hellmap-text-muted)' }}
                    >
                      지역별 감정 데이터를 분석하고 있습니다
                    </p>
                    <Progress 
                      value={analysisProgress} 
                      className="w-full"
                    />
                    <p 
                      className="text-xs mt-2"
                      style={{ color: 'var(--hellmap-text-muted)' }}
                    >
                      {Math.round(analysisProgress)}% 완료
                    </p>
                  </div>
                </div>
              ) : (
                <div 
                  className="h-full overflow-y-auto hellmap-scroll"
                  style={{ maxHeight: 'calc(90vh - 120px)' }}
                >
                  <div className="p-2 lg:p-4 space-y-3">
                    <h3 
                      className="text-lg mb-4"
                      style={{ color: 'var(--hellmap-text-primary)' }}
                    >
                      📍 지역별 현황 ({regionSummaries.length}개 구)
                    </h3>
                    
                    {regionSummaries.map((summary) => {
                      const IconComponent = {
                        SCARY: FearIcon,
                        ANNOYING: AngerIcon,
                        FUNNY: LaughIcon
                      }[summary.dominantEmotion];

                      return (
                        <Card
                          key={summary.region}
                          className={`p-3 cursor-pointer transition-all duration-300 border-2 ${
                            selectedRegion?.region === summary.region 
                              ? 'scale-105 hellmap-neon-glow' 
                              : 'hover:scale-105'
                          }`}
                          style={{
                            backgroundColor: selectedRegion?.region === summary.region 
                              ? `${getEmotionColor(summary.dominantEmotion)}20` 
                              : 'var(--hellmap-darker-bg)',
                            borderColor: getEmotionColor(summary.dominantEmotion)
                          }}
                          onClick={() => setSelectedRegion(summary)}
                        >
                          <div className="flex items-center gap-3">
                            <IconComponent size={24} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 
                                  className="font-medium"
                                  style={{ color: 'var(--hellmap-text-primary)' }}
                                >
                                  {summary.region}
                                </h4>
                                <div 
                                  className="text-xs px-2 py-1 rounded-full"
                                  style={{
                                    backgroundColor: getHellLevelColor(summary.hellLevel),
                                    color: 'black'
                                  }}
                                >
                                  지옥도 {summary.hellLevel}
                                </div>
                              </div>
                              <div 
                                className="text-xs mb-2"
                                style={{ color: 'var(--hellmap-text-muted)' }}
                              >
                                제보 {summary.totalReports}개 • {summary.dominantEmotion === 'SCARY' ? '공포' : summary.dominantEmotion === 'ANNOYING' ? '분노' : '웃음'} 우세
                              </div>
                              <div 
                                className="text-xs leading-relaxed"
                                style={{ color: 'var(--hellmap-text-secondary)' }}
                              >
                                {summary.summary}
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel - Detail View */}
            <div className="flex-1 flex flex-col min-h-0">
              {selectedRegion ? (
                <div 
                  className="overflow-y-auto hellmap-scroll border border-opacity-20" 
                  ref={selectedRegionRef}
                  style={{ 
                    height: '600px',
                    minHeight: '600px',
                    maxHeight: '600px',
                    borderColor: 'var(--hellmap-neon-blue)',
                    backgroundColor: 'rgba(0, 100, 200, 0.05)'
                  }}
                >
                  <div className="p-3 lg:p-6 space-y-4 lg:space-y-6 min-h-full">
                    {/* Region Header */}
                    <div className="text-center">
                      <h3 
                        className="text-2xl mb-2 hellmap-neon-text-shadow"
                        style={{ color: getEmotionColor(selectedRegion.dominantEmotion) }}
                      >
                        {selectedRegion.region} 분석 리포트
                      </h3>
                      <p 
                        className="text-sm"
                        style={{ color: 'var(--hellmap-text-secondary)' }}
                      >
                        {selectedRegion.summary}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <Card 
                        className="p-4 border"
                        style={{
                          backgroundColor: 'var(--hellmap-darker-bg)',
                          borderColor: 'var(--hellmap-border)'
                        }}
                      >
                        <div className="text-center">
                          <div 
                            className="text-2xl mb-1"
                            style={{ color: 'var(--hellmap-neon-blue)' }}
                          >
                            {selectedRegion.totalReports}
                          </div>
                          <div 
                            className="text-xs"
                            style={{ color: 'var(--hellmap-text-muted)' }}
                          >
                            총 제보 수
                          </div>
                        </div>
                      </Card>
                      
                      <Card 
                        className="p-4 border"
                        style={{
                          backgroundColor: 'var(--hellmap-darker-bg)',
                          borderColor: 'var(--hellmap-border)'
                        }}
                      >
                        <div className="text-center">
                          <div 
                            className="text-2xl mb-1"
                            style={{ color: getHellLevelColor(selectedRegion.hellLevel) }}
                          >
                            {selectedRegion.hellLevel}/5
                          </div>
                          <div 
                            className="text-xs"
                            style={{ color: 'var(--hellmap-text-muted)' }}
                          >
                            지옥도 레벨
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* Emotion Breakdown */}
                    <Card 
                      className="p-4 border"
                      style={{
                        backgroundColor: 'var(--hellmap-darker-bg)',
                        borderColor: 'var(--hellmap-border)'
                      }}
                    >
                      <h4 
                        className="text-sm mb-3"
                        style={{ color: 'var(--hellmap-text-primary)' }}
                      >
                        📊 감정 분포
                      </h4>
                      <div className="space-y-3">
                        {Object.entries(selectedRegion.emotionStats).map(([emotion, count]) => {
                          const percentage = selectedRegion.totalReports > 0 
                            ? (count / selectedRegion.totalReports) * 100 
                            : 0;
                          
                          const labels = {
                            SCARY: '개무섭',
                            ANNOYING: '개짜증', 
                            FUNNY: '개웃김'
                          };

                          return (
                            <div key={emotion}>
                              <div className="flex justify-between text-xs mb-1">
                                <span style={{ color: 'var(--hellmap-text-secondary)' }}>
                                  {labels[emotion as keyof typeof labels]} ({count}개)
                                </span>
                                <span style={{ color: 'var(--hellmap-text-muted)' }}>
                                  {Math.round(percentage)}%
                                </span>
                              </div>
                              <div 
                                className="h-2 rounded-full"
                                style={{ backgroundColor: 'var(--hellmap-border)' }}
                              >
                                <div 
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{ 
                                    backgroundColor: getEmotionColor(emotion),
                                    width: `${percentage}%`
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Card>

                    {/* Keywords */}
                    <Card 
                      className="p-4 border"
                      style={{
                        backgroundColor: 'var(--hellmap-darker-bg)',
                        borderColor: 'var(--hellmap-border)'
                      }}
                    >
                      <h4 
                        className="text-sm mb-3"
                        style={{ color: 'var(--hellmap-text-primary)' }}
                      >
                        🔥 핫 키워드
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedRegion.keywords.map((keyword, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 rounded-full text-xs border"
                            style={{
                              backgroundColor: `${getEmotionColor(selectedRegion.dominantEmotion)}20`,
                              borderColor: getEmotionColor(selectedRegion.dominantEmotion),
                              color: getEmotionColor(selectedRegion.dominantEmotion)
                            }}
                          >
                            #{keyword}
                          </span>
                        ))}
                      </div>
                    </Card>

                    {/* AI Image Generation */}
                    <Card 
                      className="p-4 border-2 sticky top-0 z-10"
                      style={{
                        backgroundColor: 'var(--hellmap-darker-bg)',
                        borderColor: 'var(--hellmap-neon-blue)',
                        boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)'
                      }}
                    >
                      <div className="text-center">
                        <h4 
                          className="text-lg mb-3 font-bold hellmap-neon-text-shadow"
                          style={{ color: 'var(--hellmap-neon-blue)' }}
                        >
                          🤖 AI 생성 이미지
                        </h4>
                        
                        {selectedRegion.aiImageUrl ? (
                          <div className="space-y-3">
                            <div 
                              className="relative rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => setFullscreenImage(selectedRegion.aiImageUrl || null)}
                            >
                              <ImageWithFallback
                                src={selectedRegion.aiImageUrl}
                                alt={`${selectedRegion.region} AI 이미지`}
                                className="w-full h-48 object-cover"
                              />
                              <div 
                                className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
                              />
                              <div className="absolute bottom-3 left-3 right-3">
                                <p 
                                  className="text-xs text-white mb-1"
                                >
                                  AI가 분석한 {selectedRegion.region}의 감정 상태
                                </p>
                                <p 
                                  className="text-xs text-yellow-300 font-semibold"
                                >
                                  📸 클릭하면 전체화면으로 볼 수 있어요!
                                </p>
                              </div>
                            </div>
                            <Button
                              onClick={() => handleGenerateImage(selectedRegion)}
                              disabled={isGeneratingImage}
                              className="w-full py-3 rounded-lg border-2 transition-all hover:scale-105 font-semibold"
                              style={{
                                backgroundColor: 'var(--hellmap-neon-purple)',
                                borderColor: 'var(--hellmap-neon-purple)',
                                color: 'black',
                                boxShadow: '0 0 10px rgba(255, 0, 255, 0.4)'
                              }}
                            >
                              🔄 다시 생성하기
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div 
                              className="w-full h-48 rounded-lg border-2 border-dashed flex items-center justify-center"
                              style={{ borderColor: 'var(--hellmap-border)' }}
                            >
                              <div className="text-center">
                                <div className="text-4xl mb-2">🎨</div>
                                <p 
                                  className="text-sm"
                                  style={{ color: 'var(--hellmap-text-muted)' }}
                                >
                                  AI 이미지 생성 대기 중
                                </p>
                              </div>
                            </div>
                            <Button
                              onClick={() => handleGenerateImage(selectedRegion)}
                              disabled={isGeneratingImage}
                              className="w-full py-4 rounded-lg border-2 transition-all hover:scale-105 font-bold text-lg"
                              style={{
                                backgroundColor: isGeneratingImage ? 'var(--hellmap-card-bg)' : 'var(--hellmap-neon-green)',
                                borderColor: 'var(--hellmap-neon-green)',
                                color: isGeneratingImage ? 'var(--hellmap-text-muted)' : 'black',
                                boxShadow: isGeneratingImage ? 'none' : '0 0 15px rgba(0, 255, 127, 0.5)'
                              }}
                            >
                              {isGeneratingImage ? (
                                <div className="flex items-center justify-center gap-2">
                                  <div 
                                    className="w-4 h-4 rounded-full animate-spin border-2 border-transparent border-t-current"
                                  />
                                  <span>AI 이미지 생성 중... (약 3초)</span>
                                </div>
                              ) : (
                                <span>🤖 AI 이미지 생성하기</span>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🗺️</div>
                    <h3 
                      className="text-xl mb-2"
                      style={{ color: 'var(--hellmap-text-primary)' }}
                    >
                      지역을 선택해주세요
                    </h3>
                    <p 
                      className="text-sm"
                      style={{ color: 'var(--hellmap-text-muted)' }}
                    >
                      왼쪽에서 분석할 지역을 클릭하세요
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* 전체화면 이미지 모달 */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[10000] p-4"
          onClick={() => setFullscreenImage(null)}
        >
          <div 
            className="relative max-w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={fullscreenImage}
              alt="전체화면 AI 이미지"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setFullscreenImage(null)}
              className="absolute top-4 right-4 bg-black/70 hover:bg-red-600 rounded-full p-3 transition-all hover:scale-110 font-bold text-lg"
              style={{ color: 'white' }}
            >
              ✕
            </button>
            <div 
              className="absolute bottom-4 left-4 right-4 text-center bg-black/50 rounded-lg p-2"
              style={{ color: 'white' }}
            >
              <p className="text-sm font-semibold">🖱️ 클릭하거나 ⌨️ ESC 키를 눌러 닫기</p>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}