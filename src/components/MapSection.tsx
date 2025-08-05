import { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ReportDetailModal } from './ReportDetailModal';
import { Report, Emotion } from '../../types/report';

// 백엔드 API 응답 타입
interface BackendRegionData {
  region: string;
  totalReports: number;
  scaryCount: number;
  annoyingCount: number;
  funnyCount: number;
  dominantEmotion: Emotion;
  aiImageUrl: string | null;
  hellLevel: number;
}

interface BackendRegionsResponse {
  timestamp: string;
  status: number;
  success: boolean;
  data: BackendRegionData[];
}

// AI 이미지 생성 요청 타입 (현재 직접 생성 방식 사용으로 미사용)
// interface AIImageRequest {
//   name: string;
//   dominantEmotion: Emotion;
//   hellLevel: number;
//   keywords: string[];
// }

interface RegionData {
  name: string;
  position: { lat: number; lng: number };
  emotionStats: {
    SCARY: number;
    ANNOYING: number;
    FUNNY: number;
  };
  dominantEmotion: Emotion;
  hellLevel: number;
  aiImageUrl?: string;
  totalReports: number;
  keywords: string[];
}

interface MapSectionProps {
  activeFilter: string;
  reports?: Report[];
  onReportClick?: (report: Report) => void;
}

export function MapSection({ activeFilter, reports = [], onReportClick }: MapSectionProps) {
  const [selectedRegion, setSelectedRegion] = useState<RegionData | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [regionData, setRegionData] = useState<RegionData[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [naverMap, setNaverMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [reportMarkers, setReportMarkers] = useState<any[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  
  // 전체화면 이미지 모달 상태
  const [fullscreenImage, setFullscreenImage] = useState<{
    url: string;
    title: string;
    description: string;
  } | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(true);
  const [currentLocationName, setCurrentLocationName] = useState<string>('내 위치');
  const mapRef = useRef<HTMLDivElement>(null);

  // 서울 주요 지역 좌표 (실제 위경도)
  const seoulRegions = [
    { name: '서울특별시 강남구', code: 11680, position: { lat: 37.5173, lng: 127.0473 } },
    { name: '서울특별시 서초구', code: 11650, position: { lat: 37.4837, lng: 127.0324 } },
    { name: '서울특별시 송파구', code: 11710, position: { lat: 37.5145, lng: 127.1059 } },
    { name: '서울특별시 강동구', code: 11740, position: { lat: 37.5301, lng: 127.1238 } },
    { name: '서울특별시 마포구', code: 11440, position: { lat: 37.5663, lng: 126.9019 } },
    { name: '서울특별시 서대문구', code: 11410, position: { lat: 37.5794, lng: 126.9368 } },
    { name: '서울특별시 용산구', code: 11170, position: { lat: 37.5324, lng: 126.9900 } },
    { name: '서울특별시 중구', code: 11140, position: { lat: 37.5641, lng: 126.9979 } },
    { name: '서울특별시 종로구', code: 11110, position: { lat: 37.5735, lng: 126.9788 } },
    { name: '서울특별시 성북구', code: 11290, position: { lat: 37.5894, lng: 127.0167 } },
    { name: '서울특별시 강북구', code: 11305, position: { lat: 37.6369, lng: 127.0252 } },
    { name: '서울특별시 도봉구', code: 11320, position: { lat: 37.6688, lng: 127.0471 } },
    { name: '서울특별시 노원구', code: 11350, position: { lat: 37.6544, lng: 127.0565 } },
    { name: '서울특별시 중랑구', code: 11260, position: { lat: 37.6063, lng: 127.0925 } },
    { name: '서울특별시 동대문구', code: 11230, position: { lat: 37.5744, lng: 127.0395 } },
    { name: '서울특별시 광진구', code: 11215, position: { lat: 37.5385, lng: 127.0823 } },
    { name: '서울특별시 성동구', code: 11200, position: { lat: 37.5634, lng: 127.0365 } },
    { name: '서울특별시 영등포구', code: 11560, position: { lat: 37.5264, lng: 126.8962 } },
    { name: '서울특별시 동작구', code: 11590, position: { lat: 37.5124, lng: 126.9393 } },
    { name: '서울특별시 관악구', code: 11620, position: { lat: 37.4781, lng: 126.9515 } },
    { name: '서울특별시 구로구', code: 11530, position: { lat: 37.4955, lng: 126.8874 } },
    { name: '서울특별시 금천구', code: 11545, position: { lat: 37.4570, lng: 126.8955 } },
    { name: '서울특별시 양천구', code: 11470, position: { lat: 37.5170, lng: 126.8662 } },
    { name: '서울특별시 강서구', code: 11500, position: { lat: 37.5509, lng: 126.8495 } },
    { name: '서울특별시 은평구', code: 11380, position: { lat: 37.6027, lng: 126.9291 } }
  ];

  // 현재 위치에서 가장 가까운 구 찾기
  const findNearestDistrict = (lat: number, lng: number): string => {
    let nearestDistrict = '내 위치';
    let minDistance = Infinity;

    seoulRegions.forEach(region => {
      // 간단한 거리 계산 (Haversine 공식 간소화)
      const dlat = lat - region.position.lat;
      const dlng = lng - region.position.lng;
      const distance = Math.sqrt(dlat * dlat + dlng * dlng);
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestDistrict = region.name;
      }
    });

    // 거리가 너무 멀면 (서울 밖) 기본값 사용
    return minDistance < 0.05 ? nearestDistrict : '내 위치';
  };

  // 현재 위치 가져오기
  useEffect(() => {
    const getCurrentLocation = () => {
      if (!navigator.geolocation) {
        console.warn('Geolocation이 지원되지 않습니다. 기본 위치(서울)를 사용합니다.');
        setCurrentLocation({ lat: 37.5665, lng: 126.9780 }); // 서울 중심
        setIsGettingLocation(false);
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5분간 캐시 사용
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
  
          setCurrentLocation({ lat: latitude, lng: longitude });
          
          // 가장 가까운 구 찾기
          const nearestDistrict = findNearestDistrict(latitude, longitude);
          setCurrentLocationName(nearestDistrict);
          
          
          setIsGettingLocation(false);
        },
        (error) => {
          console.warn('현재 위치 가져오기 실패:', error.message);
  
          // 실패 시 서울 중심으로 폴백
          const fallbackLat = 37.5665;
          const fallbackLng = 126.9780;
          setCurrentLocation({ lat: fallbackLat, lng: fallbackLng });
          
          // 폴백 위치의 지역명도 설정
          const nearestDistrict = findNearestDistrict(fallbackLat, fallbackLng);
          setCurrentLocationName(nearestDistrict);
          
          setIsGettingLocation(false);
        },
        options
      );
    };

    getCurrentLocation();
  }, []);

  // 네이버 지도 API 동적 로드
  useEffect(() => {
    const loadNaverMapScript = () => {
      // 이미 로드되어 있는지 확인
      if (window.naver && window.naver.maps) {
        setIsMapLoaded(true);
        return;
      }

      // 스크립트가 이미 추가되어 있는지 확인
      const existingScript = document.querySelector('script[src*="naver.com/openapi/v3/maps.js"]');
      if (existingScript) {
        // 스크립트가 있지만 아직 로드되지 않은 경우 기다림
        existingScript.addEventListener('load', () => {
          setIsMapLoaded(true);
        });
        existingScript.addEventListener('error', () => {
          setMapError('네이버 지도 API 로드에 실패했습니다.');
        });
        return;
      }

      const script = document.createElement('script');
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=gpeargraz0&submodules=geocoder`;
      script.async = true;
      script.onload = () => {
    
        setIsMapLoaded(true);
      };
      script.onerror = () => {
        console.error('네이버 지도 API 로드 실패');
        setMapError('네이버 지도 API 로드에 실패했습니다. 네트워크 연결을 확인해주세요.');
      };
      document.head.appendChild(script);
    };

    loadNaverMapScript();
  }, []);

  // 네이버 지도 초기화
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || naverMap || !currentLocation) return;

    const initMap = () => {
      try {
        if (!window.naver || !window.naver.maps) {
          console.error('네이버 지도 API가 로드되지 않았습니다.');
          setMapError('네이버 지도 API가 준비되지 않았습니다.');
          return;
        }

        if (!mapRef.current) {
          console.error('맵 컨테이너가 준비되지 않았습니다.');
          return;
        }

    

        const mapOptions = {
          center: new window.naver.maps.LatLng(currentLocation.lat, currentLocation.lng),
          zoom: 13, // 현재 위치 기준으로 좀 더 확대
          mapTypeControl: false, // 지도 타입 컨트롤 완전 비활성화
          scaleControl: false,
          logoControl: false, // 네이버 로고도 숨김
          mapDataControl: false,
          zoomControl: false, // 줌 컨트롤도 완전 비활성화
          minZoom: 10, // 최소 줌 레벨 설정
          maxZoom: 18, // 최대 줌 레벨 설정
          draggable: true,
          scrollWheel: true,
          keyboardShortcuts: false,
          disableDoubleClickZoom: false,
          disableDoubleClick: false,
          disableKineticPan: false
        };

        const map = new window.naver.maps.Map(mapRef.current, mapOptions);
        
        // 현재 위치에 마커 추가
        const currentLocationMarker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(currentLocation.lat, currentLocation.lng),
          map: map,
          icon: {
            content: `
              <div style="
                width: 24px;
                height: 24px;
                background-color: #00ccff;
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 0 10px rgba(0, 204, 255, 0.5);
                animation: pulse 2s infinite;
              ">
                <style>
                  @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.2); opacity: 0.8; }
                    100% { transform: scale(1); opacity: 1; }
                  }
                </style>
              </div>
            `,
            anchor: new window.naver.maps.Point(12, 12)
          }
        });
        console.log(currentLocationMarker);
        
        setNaverMap(map);
        setMapError(null);
      } catch (error) {
        console.error('네이버 지도 초기화 실패:', error);
        setMapError('지도 초기화에 실패했습니다: ' + (error as Error).message);
      }
    };

    // 약간의 지연을 두고 지도 초기화
    const timer = setTimeout(initMap, 100);
    return () => clearTimeout(timer);
  }, [isMapLoaded, naverMap, currentLocation, currentLocationName]);

  // 현재 위치로 지도 이동
  const moveToCurrentLocation = () => {
    if (!naverMap || !currentLocation || !window.naver) return;
    
    try {
      // 지도 중심을 현재 위치로 부드럽게 이동
      const currentPos = new window.naver.maps.LatLng(currentLocation.lat, currentLocation.lng);
      
      // 현재 줌 레벨 확인
      const currentZoom = naverMap.getZoom();
      const targetZoom = 15;
      
      // 부드러운 패닝으로 이동
      naverMap.panTo(currentPos);
      
      // 줌이 너무 작으면 부드럽게 확대
      if (currentZoom < targetZoom) {
        setTimeout(() => {
          naverMap.setZoom(targetZoom, true); // true 옵션으로 애니메이션 적용
        }, 300); // 패닝 완료 후 줌 조절
      }
      
      
    } catch (error) {
      console.error('현재 위치로 이동 실패:', error);
    }
  };

  // 백엔드에서 지역구 데이터 가져오기
  const fetchRegionsData = async (): Promise<BackendRegionData[]> => {
    try {
      const apiUrl = 'https://www.api-hellmap.shop/api/reports/regions';
  
      const response = await fetch(apiUrl);
      
      
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // 응답이 JSON인지 확인
      const contentType = response.headers.get('content-type');
      
      
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`응답이 JSON이 아닙니다. Content-Type: ${contentType}`);
      }
      
      const data: BackendRegionsResponse = await response.json();
      
      
      if (!data.success) {
        throw new Error('백엔드에서 success: false 응답');
      }
      
      
      return data.data;
    } catch (error) {
      console.error('❌ 백엔드 API 연결 실패:', error);
      
      // 개발 환경에서 백엔드 서버가 실행되지 않은 경우 빈 배열 반환
      // 실제 배포시에는 throw error; 사용하여 에러 처리
      if (error instanceof TypeError && error.message.includes('fetch')) {

        return [];
      }
      
      // 기타 에러는 다시 throw
      throw error;
    }
  };

  // 백엔드 데이터를 프론트엔드 RegionData로 변환
  const convertBackendToRegionData = (backendData: BackendRegionData[]): RegionData[] => {
    
    
    const convertedData = backendData.reduce<RegionData[]>((acc, item) => {
      
      
      // 서울 지역 좌표 매핑
      const regionPosition = seoulRegions.find(r => r.name === item.region)?.position;
      
      if (!regionPosition) {
        console.warn(`⚠️ 좌표를 찾을 수 없는 지역: ${item.region}`);

        return acc;
      }

      const regionData: RegionData = {
        name: item.region,
        position: regionPosition,
        emotionStats: {
          SCARY: item.scaryCount,
          ANNOYING: item.annoyingCount,
          FUNNY: item.funnyCount
        },
        dominantEmotion: item.dominantEmotion,
        hellLevel: item.hellLevel,
        aiImageUrl: item.aiImageUrl || undefined,
        totalReports: item.totalReports,
        keywords: [] // 추후 백엔드에서 키워드도 제공하면 매핑
      };

      
      acc.push(regionData);
      return acc;
    }, []);
    
    
    return convertedData;
  };

  // AI 이미지 생성 - 백엔드 API보다는 직접 생성이 더 안정적
  const generateAIImage = async (regionData: RegionData): Promise<string> => {
    
    
    try {
      // Pollinations.ai로 직접 이미지 생성
      const districtName = regionData.name.replace('서울특별시 ', ''); // "서울특별시 강남구" -> "강남구"
      const emotionKeywords = {
        SCARY: 'dark, horror, nightmare, eerie, sinister',
        ANNOYING: 'chaotic, frustrated, irritating, overwhelming',
        FUNNY: 'comedic, whimsical, cartoon, playful, amusing'
      };
      
      const emotionDesc = emotionKeywords[regionData.dominantEmotion] || 'urban';
      const prompt = `Seoul ${districtName} district, Korean urban landscape, ${emotionDesc}, hell level ${regionData.hellLevel}, cartoon style illustration, vibrant colors, emotional atmosphere`;
      
      let imageUrl: string;
      try {
        imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt).replace(/%20/g, '+')}?width=512&height=512&model=flux&seed=${Math.floor(Math.random() * 10000)}`;
      } catch (error) {
        console.error('URL 인코딩 실패, 기본 이미지 사용:', error);
        const fallbackImages = {
          SCARY: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&h=400&fit=crop&crop=center',
          ANNOYING: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=600&h=400&fit=crop&crop=center',
          FUNNY: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=400&fit=crop&crop=center'
        };
        return fallbackImages[regionData.dominantEmotion];
      }
      
      
      
      // 이미지 로드 확인
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {

          resolve(imageUrl);
        };
        img.onerror = () => {
          
          // fallback: 감정별 기본 이미지
          const fallbackImages = {
            SCARY: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&h=400&fit=crop&crop=center',
            ANNOYING: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=600&h=400&fit=crop&crop=center',
            FUNNY: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=400&fit=crop&crop=center'
          };
          resolve(fallbackImages[regionData.dominantEmotion]);
        };
        img.src = imageUrl;
      });
      
    } catch (error) {
      console.error(`AI 이미지 생성 실패 for ${regionData.name}:`, error);
      
      // 최종 fallback: 감정별 기본 이미지
      const fallbackImages = {
        SCARY: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&h=400&fit=crop&crop=center',
        ANNOYING: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=600&h=400&fit=crop&crop=center',
        FUNNY: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=400&fit=crop&crop=center'
      };
      
      return fallbackImages[regionData.dominantEmotion];
    }
  };

  // 감정별 색상
  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case 'SCARY': return '#FF4444';
      case 'ANNOYING': return '#FF8800';
      case 'FUNNY': return '#00FF88';
      default: return '#00AAFF';
    }
  };

  // 백엔드에서 지역별 데이터 가져오기 및 분석
  const analyzeRegions = async () => {
    setIsAnalyzing(true);

    try {
  
      
      // 1. 백엔드에서 지역구 데이터 가져오기
      const backendData = await fetchRegionsData();
      
      
      // 백엔드에서 데이터를 받지 못한 경우 처리
      if (!backendData || backendData.length === 0) {
        console.warn('⚠️ 백엔드에서 데이터를 받지 못했습니다. 빈 지도가 표시됩니다.');
        setRegionData([]);
        setIsAnalyzing(false);
        return;
      }
      
      // 2. 백엔드 데이터를 프론트엔드 형식으로 변환
      const convertedRegions = convertBackendToRegionData(backendData);
      
      
      // 3. 기본 데이터 설정 (백엔드에서 받은 AI 이미지 포함)
      setRegionData(convertedRegions);
      setIsAnalyzing(false);

      // 4. AI 이미지가 없는 지역들에 대해서만 백그라운드에서 이미지 생성

      const regionsNeedingImages = convertedRegions.filter(region => !region.aiImageUrl);
      
      
      
      if (regionsNeedingImages.length > 0) {
        
        
        // AI 이미지 생성을 백그라운드에서 병렬 처리
        const imagePromises = regionsNeedingImages.map(async (regionData) => {
          try {
            const aiImageUrl = await generateAIImage(regionData);
            setRegionData(prev => 
              prev.map(r => r.name === regionData.name ? { ...r, aiImageUrl } : r)
            );

          } catch (error) {
            console.error(`❌ AI 이미지 생성 실패: ${regionData.name}`, error);
          }
        });

        // 모든 AI 이미지 생성을 병렬로 처리 (백그라운드)
        Promise.all(imagePromises).then(() => {

        });
      } else {
        
      }

    } catch (error) {
      console.error('❌ 지역 데이터 분석 실패:', error);
      setIsAnalyzing(false);
      
      // 에러 발생시 빈 배열로 설정
      setRegionData([]);
    }
  };

  // ESC 키로 전체화면 이미지 닫기
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && fullscreenImage) {
        setFullscreenImage(null);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [fullscreenImage]);

  // 전체화면 이미지 열기 함수
  const openFullscreenImage = (url: string, title: string, description: string) => {
    setFullscreenImage({ url, title, description });
  };

  // 컴포넌트 마운트시 지역 데이터 분석 (백엔드 API 호출)
  useEffect(() => {

    analyzeRegions();
  }, []); // 컴포넌트 마운트시 한번만 실행

  // 줌 레벨 변경 감지를 위한 state 추가
  const [currentZoom, setCurrentZoom] = useState(13);

  // 지도 줌 이벤트 리스너 추가 (디바운싱 적용)
  useEffect(() => {
    if (!naverMap || !window.naver) return;

    let zoomTimeout: number;

    const handleZoomChanged = () => {
      // 기존 타임아웃 클리어
      if (zoomTimeout) {
        clearTimeout(zoomTimeout);
      }
      
      // 200ms 후에 줌 레벨 업데이트 (디바운싱)
      zoomTimeout = setTimeout(() => {
        const newZoom = naverMap.getZoom();
        setCurrentZoom(newZoom);
      }, 200);
    };

    const zoomListener = window.naver.maps.Event.addListener(naverMap, 'zoom_changed', handleZoomChanged);

    return () => {
      if (zoomTimeout) {
        clearTimeout(zoomTimeout);
      }
      window.naver.maps.Event.removeListener(zoomListener);
    };
  }, [naverMap]);

  // 지도에 마커 추가 (줌 레벨 의존성 추가)
  useEffect(() => {
    if (!naverMap || !regionData.length || !window.naver) return;



    // 기존 마커 제거
    markers.forEach(marker => {
      try {
        marker.setMap(null);
      } catch (error) {
        console.error('마커 제거 실패:', error);
      }
    });
    
    const newMarkers: any[] = [];
    const filteredRegions = activeFilter === 'all' 
      ? regionData 
      : regionData.filter(region => region.dominantEmotion === activeFilter);

    

    filteredRegions.forEach((region, index) => {
      try {
        // 지도 줌 레벨에 따른 크기 조절
        const currentZoom = naverMap.getZoom();
        const zoomFactor = Math.max(0.4, Math.min(1.3, (currentZoom - 10) / 7)); // 범위 확대: 0.4-1.3배
        
        // AI 이미지가 있으면 마커를 크게 만들되, 적절한 크기로 조정
        const hasAIImage = !!region.aiImageUrl;
        const baseSize = hasAIImage ? 75 : 30; // AI: 65→75로 증가, 제보 마커(32px)보다 2.3배 큰 차이
        const sizeMultiplier = 1 + (region.hellLevel - 1) * (hasAIImage ? 0.25 : 0.15); // AI 마커는 더 큰 증가율
        const markerSize = Math.round(baseSize * sizeMultiplier * zoomFactor);
        const emotionColor = getEmotionColor(region.dominantEmotion);
        
        // AI 이미지가 있으면 더 강한 효과
        const glowIntensity = hasAIImage ? region.hellLevel * 30 : region.hellLevel * 15; // AI 글로우 강화
        const pulseSpeed = 3 - (region.hellLevel * 0.3);
        
        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(region.position.lat, region.position.lng),
          map: naverMap,
          title: `${region.name} (지옥도: ${region.hellLevel})`,
          icon: {
            content: `
              <div class="hellmap-region-marker" style="
                position: relative;
                width: ${markerSize}px;
                height: ${markerSize}px;
                cursor: pointer;
                transform-origin: center;
                animation: hellmap-region-float ${pulseSpeed}s ease-in-out infinite;
                animation-delay: ${index * 0.3}s;
                transition: all 0.3s ease;
                z-index: ${hasAIImage ? 100 : 50};
              " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                
                ${hasAIImage ? `
                  <!-- AI 이미지가 있을 때: 폭발적인 외부 링들 (크기 재조정) -->
                  <div style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: ${markerSize + Math.round(50 * zoomFactor)}px;
                    height: ${markerSize + Math.round(50 * zoomFactor)}px;
                    border: 2px solid ${emotionColor}40;
                    border-radius: 50%;
                    animation: hellmap-ai-blast-outer ${pulseSpeed * 2}s ease-in-out infinite;
                    animation-delay: ${index * 0.1}s;
                  "></div>
                  
                  <div style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: ${markerSize + Math.round(30 * zoomFactor)}px;
                    height: ${markerSize + Math.round(30 * zoomFactor)}px;
                    border: 2px solid ${emotionColor}60;
                    border-radius: 50%;
                    animation: hellmap-ai-blast-middle ${pulseSpeed * 1.5}s ease-in-out infinite;
                    animation-delay: ${index * 0.15}s;
                  "></div>
                  
                  <div style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: ${markerSize + Math.round(15 * zoomFactor)}px;
                    height: ${markerSize + Math.round(15 * zoomFactor)}px;
                    border: 1px solid ${emotionColor}80;
                    border-radius: 50%;
                    background: ${emotionColor}15;
                    animation: hellmap-ai-blast-inner ${pulseSpeed}s ease-in-out infinite;
                    animation-delay: ${index * 0.2}s;
                  "></div>
                ` : `
                  <!-- 일반 마커용 기본 펄스 링 (크기 축소) -->
                  <div style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: ${markerSize + Math.round(15 * zoomFactor)}px;
                    height: ${markerSize + Math.round(15 * zoomFactor)}px;
                    border: 2px solid ${emotionColor}60;
                    border-radius: 50%;
                    animation: hellmap-region-pulse-outer ${pulseSpeed * 1.5}s ease-in-out infinite;
                    animation-delay: ${index * 0.2}s;
                  "></div>
                  
                  <div style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: ${markerSize + Math.round(8 * zoomFactor)}px;
                    height: ${markerSize + Math.round(8 * zoomFactor)}px;
                    border: 1px solid ${emotionColor}80;
                    border-radius: 50%;
                    background: ${emotionColor}10;
                    animation: hellmap-region-pulse-inner ${pulseSpeed}s ease-in-out infinite;
                    animation-delay: ${index * 0.1}s;
                  "></div>
                `}
                
                <!-- 메인 마커 컨테이너 -->
                <div style="
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  width: ${markerSize}px;
                  height: ${markerSize}px;
                  background: ${hasAIImage 
                    ? `conic-gradient(from 0deg, ${emotionColor}, ${emotionColor}FF, ${emotionColor}AA, ${emotionColor})` 
                    : `conic-gradient(from 0deg, ${emotionColor}, ${emotionColor}80, ${emotionColor}60, ${emotionColor})`
                  };
                  border: ${hasAIImage ? '4px' : '3px'} solid ${emotionColor};
                  border-radius: ${hasAIImage ? '50%' : '20%'};
                  ${hasAIImage ? '' : `clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);`}
                  box-shadow: 
                    0 0 ${glowIntensity}px ${emotionColor}80,
                    0 0 ${glowIntensity * 1.5}px ${emotionColor}60,
                    0 0 ${glowIntensity * 2}px ${emotionColor}40,
                    ${hasAIImage ? `0 0 ${glowIntensity * 3}px ${emotionColor}20,` : ''}
                    inset 0 2px 8px rgba(255,255,255,0.3),
                    inset 0 -2px 8px rgba(0,0,0,0.4);
                  transition: all 0.3s ease;
                  overflow: hidden;
                  ${hasAIImage ? 'animation: hellmap-ai-image-pulse 2s ease-in-out infinite;' : ''}
                ">
                  
                  <!-- AI 이미지 컨테이너 -->
                  <div style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: ${markerSize - Math.round((hasAIImage ? 8 : 6) * zoomFactor)}px;
                    height: ${markerSize - Math.round((hasAIImage ? 8 : 6) * zoomFactor)}px;
                    border-radius: ${hasAIImage ? '50%' : '15%'};
                    ${hasAIImage ? '' : `clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);`}
                    overflow: hidden;
                    background: ${region.aiImageUrl 
                      ? `url('${region.aiImageUrl}') center/cover no-repeat` 
                      : `linear-gradient(135deg, ${emotionColor}40, ${emotionColor}20)`
                    };
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    ${hasAIImage ? 'animation: hellmap-ai-image-reveal 1s ease-out;' : ''}
                  ">
                    ${!region.aiImageUrl ? `
                      <!-- AI 로딩 플레이스홀더 -->
                      <div style="
                        color: ${emotionColor};
                        font-size: ${Math.round(markerSize * (hasAIImage ? 0.22 : 0.28) * zoomFactor)}px;
                        animation: hellmap-ai-loading 2s linear infinite;
                        text-shadow: 0 0 10px ${emotionColor};
                      ">🤖</div>
                      
                      <!-- 로딩 중일 때 추가 효과 -->
                      <div style="
                        position: absolute;
                        inset: 0;
                        background: conic-gradient(from 0deg, ${emotionColor}30, transparent, ${emotionColor}30);
                        animation: hellmap-ai-loading-spin 3s linear infinite;
                        border-radius: inherit;
                      "></div>
                    ` : `
                      <!-- AI 이미지가 있을 때 스캔 효과 강화 -->
                      <div style="
                        position: absolute;
                        inset: 0;
                        background: linear-gradient(45deg, transparent 30%, ${emotionColor}30 50%, transparent 70%);
                        background-size: 200% 200%;
                        animation: hellmap-ai-scan-enhanced 2s ease-in-out infinite;
                        border-radius: inherit;
                      "></div>
                      
                      <!-- AI 배지 (크기 재조정) -->
                      <div style="
                        position: absolute;
                        top: ${Math.round(-4 * zoomFactor)}px;
                        right: ${Math.round(-4 * zoomFactor)}px;
                        width: ${Math.round(20 * zoomFactor)}px;
                        height: ${Math.round(20 * zoomFactor)}px;
                        background: linear-gradient(135deg, #00ff88, #00ccff);
                        border: ${Math.round(2 * zoomFactor)}px solid white;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: ${Math.round(10 * zoomFactor)}px;
                        font-weight: bold;
                        color: black;
                        animation: hellmap-ai-badge-pulse 1.5s ease-in-out infinite;
                        box-shadow: 0 0 ${Math.round(15 * zoomFactor)}px #00ff88;
                      ">AI</div>
                    `}
                  </div>
                  
                  ${hasAIImage ? `
                    <!-- AI 이미지가 있을 때만: 추가 스캔 라인들 (크기 조절) -->
                    <div style="
                      position: absolute;
                      top: 0;
                      left: -100%;
                      width: 100%;
                      height: ${Math.max(1, Math.round(2 * zoomFactor))}px;
                      background: linear-gradient(90deg, transparent, ${emotionColor}, transparent);
                      animation: hellmap-scan-line-horizontal 2s ease-in-out infinite;
                      animation-delay: ${index * 0.4}s;
                    "></div>
                    
                    <div style="
                      position: absolute;
                      top: -100%;
                      left: 0;
                      width: ${Math.max(1, Math.round(2 * zoomFactor))}px;
                      height: 100%;
                      background: linear-gradient(180deg, transparent, ${emotionColor}, transparent);
                      animation: hellmap-scan-line-vertical 2.5s ease-in-out infinite;
                      animation-delay: ${index * 0.3}s;
                    "></div>
                  ` : `
                    <!-- 일반 마커용 기본 스캔 라인 (크기 조절) -->
                    <div style="
                      position: absolute;
                      top: 0;
                      left: -100%;
                      width: 100%;
                      height: ${Math.max(1, Math.round(2 * zoomFactor))}px;
                      background: linear-gradient(90deg, transparent, ${emotionColor}, transparent);
                      animation: hellmap-scan-line-horizontal 2s ease-in-out infinite;
                      animation-delay: ${index * 0.4}s;
                    "></div>
                  `}
                </div>
                
                <!-- 지옥도 레벨 배지 (크기 재조정) -->
                <div style="
                  position: absolute;
                  top: ${Math.round((hasAIImage ? -10 : -6) * zoomFactor)}px;
                  right: ${Math.round((hasAIImage ? -10 : -6) * zoomFactor)}px;
                  width: ${Math.round((hasAIImage ? 26 : 18) * zoomFactor)}px;
                  height: ${Math.round((hasAIImage ? 26 : 18) * zoomFactor)}px;
                  background: linear-gradient(135deg, #ff6b6b, #ff8787);
                  border: ${Math.round(2 * zoomFactor)}px solid #fff;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-size: ${Math.round((hasAIImage ? 12 : 9) * zoomFactor)}px;
                  font-weight: bold;
                  box-shadow: 0 0 ${Math.round((hasAIImage ? 18 : 12) * zoomFactor)}px #ff6b6b80;
                  animation: hellmap-level-pulse ${pulseSpeed * 0.8}s ease-in-out infinite;
                  z-index: 10;
                ">
                  ${region.hellLevel}
                </div>
                
                <!-- 감정 이모지 (크기 재조정) -->
                <div style="
                  position: absolute;
                  top: ${Math.round((hasAIImage ? -8 : -4) * zoomFactor)}px;
                  left: ${Math.round((hasAIImage ? -8 : -4) * zoomFactor)}px;
                  width: ${Math.round((hasAIImage ? 22 : 15) * zoomFactor)}px;
                  height: ${Math.round((hasAIImage ? 22 : 15) * zoomFactor)}px;
                  background: ${emotionColor};
                  border: ${Math.round(2 * zoomFactor)}px solid white;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: ${Math.round((hasAIImage ? 11 : 8) * zoomFactor)}px;
                  box-shadow: 0 0 ${Math.round((hasAIImage ? 15 : 8) * zoomFactor)}px ${emotionColor}80;
                ">
                  ${region.dominantEmotion === 'SCARY' ? '😨' : region.dominantEmotion === 'ANNOYING' ? '😠' : '😂'}
                </div>
                
                <!-- 제보 수 표시 (크기 재조정) -->
                <div style="
                  position: absolute;
                  bottom: ${Math.round((hasAIImage ? -14 : -10) * zoomFactor)}px;
                  left: 50%;
                  transform: translateX(-50%);
                  background: rgba(0,0,0,0.8);
                  border: ${Math.round(1 * zoomFactor)}px solid ${emotionColor};
                  border-radius: ${Math.round(6 * zoomFactor)}px;
                  padding: ${Math.round((hasAIImage ? 3 : 1.5) * zoomFactor)}px ${Math.round((hasAIImage ? 8 : 5) * zoomFactor)}px;
                  color: ${emotionColor};
                  font-size: ${Math.round((hasAIImage ? 10 : 7) * zoomFactor)}px;
                  font-weight: bold;
                  white-space: nowrap;
                  box-shadow: 0 0 ${Math.round((hasAIImage ? 12 : 6) * zoomFactor)}px ${emotionColor}60;
                ">
                  ${region.totalReports}개 제보
                </div>
                
                <!-- 구 이름 라벨 (크기 재조정) -->
                <div style="
                  position: absolute;
                  top: ${Math.round((hasAIImage ? -35 : -24) * zoomFactor)}px;
                  left: 50%;
                  transform: translateX(-50%);
                  background: linear-gradient(135deg, ${emotionColor}95, ${emotionColor}80);
                  color: white;
                  padding: ${Math.round((hasAIImage ? 5 : 2) * zoomFactor)}px ${Math.round((hasAIImage ? 14 : 8) * zoomFactor)}px;
                  border-radius: ${Math.round((hasAIImage ? 14 : 8) * zoomFactor)}px;
                  font-size: ${Math.round((hasAIImage ? 16 : 8) * zoomFactor)}px;
                  font-weight: bold;
                  white-space: nowrap;
                  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
                  box-shadow: 0 2px 8px rgba(0,0,0,0.3), 0 0 ${Math.round((hasAIImage ? 15 : 10) * zoomFactor)}px ${emotionColor}40;
                  border: ${Math.round(1 * zoomFactor)}px solid rgba(255,255,255,0.3);
                  backdrop-filter: blur(4px);
                  ${hasAIImage ? 'animation: hellmap-ai-label-glow 3s ease-in-out infinite;' : ''}
                ">
                  ${hasAIImage ? '🤖 ' : ''}${region.name}
                  <div style="
                    position: absolute;
                    bottom: ${Math.round(-4 * zoomFactor)}px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 0;
                    height: 0;
                    border-left: ${Math.round(4 * zoomFactor)}px solid transparent;
                    border-right: ${Math.round(4 * zoomFactor)}px solid transparent;
                    border-top: ${Math.round(4 * zoomFactor)}px solid ${emotionColor}95;
                  "></div>
                </div>
                
                <!-- 3D 그림자 (크기 재조정) -->
                <div style="
                  position: absolute;
                  bottom: ${Math.round((hasAIImage ? -10 : -5) * zoomFactor)}px;
                  left: 50%;
                  transform: translateX(-50%);
                  width: ${Math.round(markerSize * (hasAIImage ? 1.0 : 0.7))}px;
                  height: ${Math.round((hasAIImage ? 12 : 6) * zoomFactor)}px;
                  background: ${emotionColor}30;
                  border-radius: 50%;
                  filter: blur(${Math.round((hasAIImage ? 6 : 3) * zoomFactor)}px);
                  animation: hellmap-shadow-float ${pulseSpeed}s ease-in-out infinite;
                  animation-delay: ${index * 0.3}s;
                "></div>
                
                <!-- AI 이미지가 있을 때만: 특별한 홀로그램 효과 (크기 재조정) -->
                ${hasAIImage && region.hellLevel >= 3 ? `
                  <div style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: ${markerSize + Math.round(60 * zoomFactor)}px;
                    height: ${markerSize + Math.round(60 * zoomFactor)}px;
                    border: ${Math.round(1 * zoomFactor)}px solid ${emotionColor}30;
                    border-radius: 50%;
                    animation: hellmap-ai-hologram ${pulseSpeed * 3}s linear infinite;
                  "></div>
                  
                  <div style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: ${markerSize + Math.round(80 * zoomFactor)}px;
                    height: ${markerSize + Math.round(80 * zoomFactor)}px;
                    border: ${Math.round(1 * zoomFactor)}px solid ${emotionColor}20;
                    border-radius: 50%;
                    animation: hellmap-ai-hologram ${pulseSpeed * 4}s linear infinite reverse;
                  "></div>
                ` : ''}
              </div>
            `,
            anchor: new window.naver.maps.Point(markerSize/2, markerSize/2)
          }
        });

        // 마커 클릭 이벤트
        window.naver.maps.Event.addListener(marker, 'click', () => {
    
          setSelectedRegion(region);
        });

        newMarkers.push(marker);

      } catch (error) {
        console.error(`마커 생성 실패 for ${region.name}:`, error);
      }
    });

    setMarkers(newMarkers);
    
  }, [naverMap, regionData, activeFilter, currentZoom]);

  // 개별 제보 마커 추가
  useEffect(() => {
    if (!naverMap || !reports.length || !window.naver) return;



    // 기존 제보 마커 제거
    reportMarkers.forEach(marker => {
      try {
        marker.setMap(null);
      } catch (error) {
        console.error('제보 마커 제거 실패:', error);
      }
    });
    
    const newReportMarkers: any[] = [];
    const filteredReports = activeFilter === 'all' 
      ? reports 
      : reports.filter(report => report.emotion === activeFilter);

    

    // 모든 제보 표시
    filteredReports.forEach((report, index) => {
      try {
        // 실제 위도/경도 사용
        const markerPosition = new window.naver.maps.LatLng(
          report.latitude,
          report.longitude
        );

        // 감정별 이모지와 스타일
        const emotionConfig = {
          SCARY: { emoji: '😨', pulse: 'hellmap-fear-pulse', glow: '#ff0044' },
          ANNOYING: { emoji: '😠', pulse: 'hellmap-anger-pulse', glow: '#ff6600' },
          FUNNY: { emoji: '😂', pulse: 'hellmap-laugh-pulse', glow: '#00ff88' }
        };

        const config = emotionConfig[report.emotion];
        const markerSize = 32;

        const marker = new window.naver.maps.Marker({
          position: markerPosition,
          map: naverMap,
          title: report.title,
          icon: {
            content: `
              <div style="
                position: relative;
                width: ${markerSize}px;
                height: ${markerSize}px;
                cursor: pointer;
                transform-origin: center;
                animation: hellmap-report-float 2s ease-in-out infinite;
                animation-delay: ${index * 0.2}s;
              ">
                <!-- 외부 글로우 링 -->
                <div style="
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  width: ${markerSize + 8}px;
                  height: ${markerSize + 8}px;
                  border: 2px solid ${config.glow};
                  border-radius: 50%;
                  background: ${config.glow}10;
                  animation: hellmap-pulse-ring 1.5s ease-in-out infinite;
                  animation-delay: ${index * 0.1}s;
                "></div>
                
                <!-- 메인 마커 -->
                <div style="
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  width: ${markerSize}px;
                  height: ${markerSize}px;
                  background: linear-gradient(135deg, ${config.glow}, ${config.glow}80);
                  border: 2px solid ${config.glow};
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: ${markerSize/2}px;
                  box-shadow: 
                    0 0 15px ${config.glow}80,
                    0 0 25px ${config.glow}60,
                    inset 0 2px 4px rgba(255,255,255,0.3),
                    inset 0 -2px 4px rgba(0,0,0,0.3);
                  transition: all 0.3s ease;
                  z-index: 1;
                ">
                  ${config.emoji}
                </div>

                <!-- 제보 제목 툴팁 -->
                <div style="
                  position: absolute;
                  bottom: 100%;
                  left: 50%;
                  transform: translateX(-50%);
                  margin-bottom: 8px;
                  padding: 4px 8px;
                  background: rgba(0, 0, 0, 0.8);
                  color: white;
                  font-size: 12px;
                  border-radius: 4px;
                  white-space: nowrap;
                  opacity: 0;
                  transition: opacity 0.2s;
                  pointer-events: none;
                  z-index: 2;
                ">
                  ${report.title}
                </div>
              </div>
            `,
            anchor: new window.naver.maps.Point(markerSize/2, markerSize/2)
          }
        });

        // 마커 클릭 이벤트
        window.naver.maps.Event.addListener(marker, 'click', () => {
    
          if (onReportClick) {
            onReportClick(report);
          }
        });

        newReportMarkers.push(marker);
      } catch (error) {
        console.error(`제보 마커 생성 실패 for ${report.title}:`, error);
      }
    });

    setReportMarkers(newReportMarkers);

  }, [naverMap, reports, activeFilter, onReportClick]);

  // 지도 컨트롤은 모두 비활성화되어 있으므로 동적 조정 불필요

  // 지역별 데이터 분석 시작
  useEffect(() => {
    if (reports.length > 0) {
      analyzeRegions();
    }
  }, [reports]);

  return (
    <div className="h-full relative">
      {/* AI 마커 애니메이션 스타일 */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes hellmap-ai-blast-outer {
          0%, 100% { 
            opacity: 0.3; 
            transform: translate(-50%, -50%) scale(0.8); 
          }
          50% { 
            opacity: 0.8; 
            transform: translate(-50%, -50%) scale(1.2); 
          }
        }
        
        @keyframes hellmap-ai-blast-middle {
          0%, 100% { 
            opacity: 0.4; 
            transform: translate(-50%, -50%) scale(0.9); 
          }
          50% { 
            opacity: 0.7; 
            transform: translate(-50%, -50%) scale(1.1); 
          }
        }
        
        @keyframes hellmap-ai-blast-inner {
          0%, 100% { 
            opacity: 0.5; 
            transform: translate(-50%, -50%) scale(1); 
          }
          50% { 
            opacity: 0.9; 
            transform: translate(-50%, -50%) scale(1.05); 
          }
        }
        
        @keyframes hellmap-ai-image-pulse {
          0%, 100% { 
            transform: translate(-50%, -50%) scale(1);
            box-shadow: 0 0 20px currentColor;
          }
          50% { 
            transform: translate(-50%, -50%) scale(1.02);
            box-shadow: 0 0 30px currentColor, 0 0 40px currentColor;
          }
        }
        
        @keyframes hellmap-ai-image-reveal {
          0% {
            opacity: 0;
            transform: scale(0.5);
            filter: blur(10px);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
            filter: blur(2px);
          }
          100% {
            opacity: 1;
            transform: scale(1);
            filter: blur(0);
          }
        }
        
        @keyframes hellmap-ai-loading-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes hellmap-ai-scan-enhanced {
          0% { 
            background-position: -200% -200%;
            opacity: 0.3;
          }
          50% {
            background-position: 0% 0%;
            opacity: 0.8;
          }
          100% { 
            background-position: 200% 200%;
            opacity: 0.3;
          }
        }
        
        @keyframes hellmap-ai-badge-pulse {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 0 0 15px #00ff88;
          }
          50% { 
            transform: scale(1.1);
            box-shadow: 0 0 25px #00ff88, 0 0 35px #00ccff;
          }
        }
        
        @keyframes hellmap-scan-line-vertical {
          0% { 
            top: -100%;
            opacity: 0;
          }
          50% { 
            opacity: 1;
          }
          100% { 
            top: 100%;
            opacity: 0;
          }
        }
        
        @keyframes hellmap-ai-label-glow {
          0%, 100% {
            box-shadow: 0 2px 8px rgba(0,0,0,0.3), 0 0 16px currentColor;
          }
          50% {
            box-shadow: 0 2px 8px rgba(0,0,0,0.3), 0 0 25px currentColor, 0 0 35px currentColor;
          }
        }
        
        @keyframes hellmap-ai-hologram {
          0% { 
            opacity: 0.1; 
            transform: translate(-50%, -50%) scale(0.8) rotate(0deg); 
          }
          50% { 
            opacity: 0.4; 
            transform: translate(-50%, -50%) scale(1.1) rotate(180deg); 
          }
          100% { 
            opacity: 0.1; 
            transform: translate(-50%, -50%) scale(0.8) rotate(360deg); 
          }
        }
        
        @keyframes hellmap-modal-reveal {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0px);
          }
        }
      `}} />

      {/* 지도 컨테이너 */}
      <div 
        ref={mapRef} 
        className="w-full h-full"
        style={{ 
          minHeight: '400px',
          backgroundColor: 'var(--hellmap-darker-bg)',
        }}
      />

      {/* 지도 위 UI 오버레이 */}
      <div className="absolute inset-0 pointer-events-none">
        {/* 지도 로딩 상태 */}
        {(!isMapLoaded || isGettingLocation) && !mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-auto">
            <Card 
              className="p-6 border"
              style={{
                backgroundColor: 'var(--hellmap-card-bg)',
                borderColor: 'var(--hellmap-neon-blue)'
              }}
            >
              <div className="text-center">
                <div 
                  className="w-12 h-12 mx-auto mb-4 rounded-full animate-spin border-4 border-transparent"
                  style={{ 
                    borderTopColor: 'var(--hellmap-neon-blue)',
                    borderRightColor: 'var(--hellmap-neon-green)'
                  }}
                />
                <p 
                  className="text-sm"
                  style={{ color: 'var(--hellmap-text-primary)' }}
                >
                  {isGettingLocation ? '📍 현재 위치를 확인하는 중...' : '🗺️ 네이버 지도를 로딩 중...'}
                </p>
                {isGettingLocation && (
                  <p 
                    className="text-xs mt-2"
                    style={{ color: 'var(--hellmap-text-muted)' }}
                  >
                    위치 권한을 허용해주세요
                  </p>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* 지도 에러 상태 */}
        {mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-auto">
            <Card 
              className="p-6 border max-w-md"
              style={{
                backgroundColor: 'var(--hellmap-card-bg)',
                borderColor: 'var(--hellmap-fear-color)'
              }}
            >
              <div className="text-center">
                <div className="text-4xl mb-4">⚠️</div>
                <h3 
                  className="text-lg mb-2"
                  style={{ color: 'var(--hellmap-text-primary)' }}
                >
                  지도 로드 오류
                </h3>
                <p 
                  className="text-sm mb-4"
                  style={{ color: 'var(--hellmap-text-secondary)' }}
                >
                  {mapError}
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--hellmap-neon-blue)',
                    borderColor: 'var(--hellmap-neon-blue)',
                    color: 'black'
                  }}
                >
                  새로고침
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* AI 분석 로딩 */}
        {isAnalyzing && isMapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm pointer-events-auto">
            <Card 
              className="p-6 border"
              style={{
                backgroundColor: 'var(--hellmap-card-bg)',
                borderColor: 'var(--hellmap-neon-green)'
              }}
            >
              <div className="text-center">
                <div 
                  className="w-12 h-12 mx-auto mb-4 rounded-full animate-spin border-4 border-transparent"
                  style={{ 
                    borderTopColor: 'var(--hellmap-neon-green)',
                    borderRightColor: 'var(--hellmap-neon-blue)'
                  }}
                />
                <p 
                  className="text-sm"
                  style={{ color: 'var(--hellmap-text-primary)' }}
                >
                  🤖 AI가 지역을 분석하고 있습니다...
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* Current Location Info */}
        {isMapLoaded && !mapError && currentLocation && (
          <div className="absolute top-4 left-4 pointer-events-auto">
            <Card 
              className="p-3 border hellmap-card-glow cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg group"
              style={{
                backgroundColor: 'var(--hellmap-card-bg)',
                borderColor: '#007AFF'
              }}
              onClick={moveToCurrentLocation}
            >
              <div className="flex items-center gap-3">
                {/* 현재 위치 아이콘 */}
                <div className="relative">
                  <div 
                    className="w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 group-hover:scale-110" 
                    style={{ backgroundColor: '#007AFF', borderColor: 'white' }}
                  >
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                  {/* 펄스 링 */}
                  <div 
                    className="absolute top-0 left-0 w-8 h-8 border-2 rounded-full animate-ping group-hover:animate-pulse"
                    style={{ borderColor: '#007AFF40' }}
                  />
                </div>
                
                {/* 위치 정보 */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-sm font-medium group-hover:text-blue-300 transition-colors"
                      style={{ color: '#007AFF' }}
                    >
                      📍 현재 위치
                    </span>
                    {isGettingLocation && (
                      <div 
                        className="w-3 h-3 border border-t-transparent rounded-full animate-spin"
                        style={{ borderColor: '#007AFF' }}
                      />
                    )}
                  </div>
                  
                  <div 
                    className="text-sm group-hover:text-white transition-colors"
                    style={{ color: 'var(--hellmap-text-primary)' }}
                  >
                    {isGettingLocation ? '위치 확인 중...' : currentLocationName}
                  </div>
                  
                  {!isGettingLocation && (
                    <div 
                      className="text-xs mt-1 group-hover:text-gray-300 transition-colors"
                      style={{ color: 'var(--hellmap-text-muted)' }}
                    >
                      클릭하여 현재 위치로 이동
                    </div>
                  )}
                </div>
                
                {/* 이동 아이콘 */}
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-125 group-hover:rotate-180"
                  style={{ backgroundColor: '#007AFF20' }}
                >
                  <span className="text-xs">🎯</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Map Legend */}
        {isMapLoaded && !mapError && (
          <div className="absolute bottom-4 left-4 pointer-events-auto">
            <Card 
              className="p-3 border"
              style={{
                backgroundColor: 'var(--hellmap-card-bg)',
                borderColor: 'var(--hellmap-border)'
              }}
            >
              <div className="space-y-2">
                <h4 
                  className="text-xs mb-2"
                  style={{ color: 'var(--hellmap-text-primary)' }}
                >
                  🗺️ 헬맵 감정 분석
                </h4>
                
                {/* 지역 마커 설명 */}
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-5 h-5 flex items-center justify-center relative"
                      style={{ 
                        background: `conic-gradient(from 0deg, #FF4444, #FF444480, #FF444460, #FF4444)`,
                        border: '1px solid #FF4444',
                        clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
                        borderRadius: '20%'
                      }}
                    >
                      <span style={{ fontSize: '6px' }}>🤖</span>
                    </div>
                    <span style={{ color: 'var(--hellmap-text-muted)' }}>AI 분석 지역 (헥사곤)</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center" style={{ backgroundColor: '#FF444440', borderColor: '#FF4444' }}>
                      <span style={{ fontSize: '8px' }}>😨</span>
                    </div>
                    <span style={{ color: 'var(--hellmap-text-muted)' }}>개무섭 감정</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center" style={{ backgroundColor: '#FF880040', borderColor: '#FF8800' }}>
                      <span style={{ fontSize: '8px' }}>😠</span>
                    </div>
                    <span style={{ color: 'var(--hellmap-text-muted)' }}>개짜증 감정</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center" style={{ backgroundColor: '#00FF8840', borderColor: '#00FF88' }}>
                      <span style={{ fontSize: '8px' }}>😂</span>
                    </div>
                    <span style={{ color: 'var(--hellmap-text-muted)' }}>개웃김 감정</span>
                  </div>
                </div>
                
                <div 
                  className="text-xs mt-2 pt-2 border-t"
                  style={{ 
                    borderColor: 'var(--hellmap-border)',
                    color: 'var(--hellmap-text-muted)' 
                  }}
                >
                  🔸 <strong>헥사곤 마커</strong>: AI 분석된 지역<br/>
                  🏷️ <strong>구 이름 라벨</strong>: 지역 식별 표시<br/>
                  📍 <strong>현재 위치</strong>: 가장 가까운 구 표시<br/>
                  🎯 <strong>네온 마커</strong>: 개별 제보<br/>
                  ❤️ <strong>빨간 배지</strong>: 좋아요/지옥도<br/>
                  ✨ <strong>홀로그램</strong>: 고위험 지역 (Lv4+)
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* AI Analysis Status */}
        {isMapLoaded && !mapError && (
          <div className="absolute top-4 right-4 pointer-events-auto">
            <Card 
              className="p-2 border"
              style={{
                backgroundColor: 'var(--hellmap-card-bg)',
                borderColor: 'var(--hellmap-neon-green)'
              }}
            >
              <div className="flex items-center gap-2 text-xs">
                <div 
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: 'var(--hellmap-neon-green)' }}
                />
                <span style={{ color: 'var(--hellmap-neon-green)' }}>
                  AI 분석 활성화
                </span>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Enhanced Region Detail Modal */}
      {selectedRegion && (
        <div 
          className="absolute inset-0 flex items-center justify-center z-50 p-4 pointer-events-auto"
          style={{
            background: 'radial-gradient(circle at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.95) 100%)',
            backdropFilter: 'blur(8px)'
          }}
          onClick={() => setSelectedRegion(null)}
        >
          <Card 
            className="max-w-lg w-full border-2 overflow-hidden transform transition-all duration-300 hover:scale-[1.02]"
            style={{
              backgroundColor: 'var(--hellmap-card-bg)',
              borderColor: getEmotionColor(selectedRegion.dominantEmotion),
              boxShadow: `0 0 40px ${getEmotionColor(selectedRegion.dominantEmotion)}40, 0 20px 40px rgba(0,0,0,0.4)`,
              animation: 'hellmap-modal-reveal 0.4s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Enhanced AI Image Header */}
            {selectedRegion.aiImageUrl ? (
              <div className="relative h-60 overflow-hidden">
                <div 
                  className="w-full h-full cursor-pointer"
                  onClick={() => openFullscreenImage(
                    selectedRegion.aiImageUrl!,
                    selectedRegion.name,
                    `🤖 AI가 분석한 ${selectedRegion.name.replace('서울특별시 ', '')}의 감정 상태`
                  )}
                >
                  <ImageWithFallback
                    src={selectedRegion.aiImageUrl}
                    alt={`${selectedRegion.name} AI 이미지`}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                
                {/* Dynamic Overlay with Emotion Color */}
                <div 
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(45deg, 
                      ${getEmotionColor(selectedRegion.dominantEmotion)}15 0%, 
                      transparent 30%, 
                      transparent 70%, 
                      ${getEmotionColor(selectedRegion.dominantEmotion)}25 100%),
                      linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 100%)`
                  }}
                />
                
                {/* AI Badge */}
                <div 
                  className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: `${getEmotionColor(selectedRegion.dominantEmotion)}90`,
                    color: 'white',
                    boxShadow: `0 0 15px ${getEmotionColor(selectedRegion.dominantEmotion)}60`,
                    animation: 'hellmap-ai-badge-pulse 2s ease-in-out infinite'
                  }}
                >
                  🤖 AI 생성
                </div>

                {/* Hell Level Badge */}
                <div 
                  className="absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{
                    background: 'linear-gradient(135deg, #ff6b6b, #ff8787)',
                    boxShadow: '0 0 20px #ff6b6b60',
                    animation: 'hellmap-level-pulse 1.5s ease-in-out infinite'
                  }}
                >
                  {selectedRegion.hellLevel}
                </div>

                {/* Image Click Overlay Hint */}
                <div 
                  className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-300 flex items-center justify-center cursor-pointer"
                  onClick={() => openFullscreenImage(
                    selectedRegion.aiImageUrl!,
                    selectedRegion.name,
                    `🤖 AI가 분석한 ${selectedRegion.name.replace('서울특별시 ', '')}의 감정 상태`
                  )}
                >
                  <div className="opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black/60 rounded-full p-3">
                    <div className="text-white text-xl">🔍</div>
                  </div>
                </div>

                {/* Region Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
                  <h3 
                    className="text-2xl font-bold mb-1 drop-shadow-lg"
                    style={{ 
                      color: 'white',
                      textShadow: `0 0 20px ${getEmotionColor(selectedRegion.dominantEmotion)}, 0 2px 4px rgba(0,0,0,0.8)`
                    }}
                  >
                    {selectedRegion.name}
                  </h3>
                  <p 
                    className="text-sm opacity-90"
                    style={{ color: 'white' }}
                  >
                    🤖 AI가 분석한 {selectedRegion.name.replace('서울특별시 ', '')}의 감정 상태
                    <span className="ml-2 text-xs opacity-70">클릭하여 확대</span>
                  </p>
                </div>

                {/* Close Button */}
                <Button
                  onClick={() => setSelectedRegion(null)}
                  className="absolute top-3 right-16 w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform backdrop-blur-sm"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    borderColor: 'rgba(255,255,255,0.3)',
                    color: 'white'
                  }}
                >
                  ✕
                </Button>
              </div>
            ) : (
              /* Fallback Header for regions without AI images */
              <div 
                className="relative h-40 overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, 
                    ${getEmotionColor(selectedRegion.dominantEmotion)}20 0%, 
                    ${getEmotionColor(selectedRegion.dominantEmotion)}40 50%, 
                    ${getEmotionColor(selectedRegion.dominantEmotion)}20 100%)`
                }}
              >
                {/* Animated Background Pattern */}
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `radial-gradient(circle at 20% 20%, ${getEmotionColor(selectedRegion.dominantEmotion)}60 0%, transparent 50%),
                                      radial-gradient(circle at 80% 80%, ${getEmotionColor(selectedRegion.dominantEmotion)}40 0%, transparent 50%),
                                      radial-gradient(circle at 40% 60%, ${getEmotionColor(selectedRegion.dominantEmotion)}30 0%, transparent 50%)`,
                    animation: 'hellmap-ai-hologram 8s ease-in-out infinite'
                  }}
                />

                {/* Loading/Generating Badge */}
                <div 
                  className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: `${getEmotionColor(selectedRegion.dominantEmotion)}80`,
                    color: 'white',
                    boxShadow: `0 0 15px ${getEmotionColor(selectedRegion.dominantEmotion)}60`,
                    animation: 'hellmap-ai-loading 2s linear infinite'
                  }}
                >
                  🤖 AI 이미지 준비중
                </div>

                {/* Hell Level Badge */}
                <div 
                  className="absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{
                    background: 'linear-gradient(135deg, #ff6b6b, #ff8787)',
                    boxShadow: '0 0 20px #ff6b6b60',
                    animation: 'hellmap-level-pulse 1.5s ease-in-out infinite'
                  }}
                >
                  {selectedRegion.hellLevel}
                </div>

                {/* Centered Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                  <div 
                    className="text-6xl mb-2 animate-pulse"
                    style={{
                      filter: `drop-shadow(0 0 20px ${getEmotionColor(selectedRegion.dominantEmotion)})`
                    }}
                  >
                    {selectedRegion.dominantEmotion === 'SCARY' ? '😱' : 
                     selectedRegion.dominantEmotion === 'ANNOYING' ? '😤' : '🤣'}
                  </div>
                  <h3 
                    className="text-2xl font-bold mb-1 text-center"
                    style={{ 
                      color: 'white',
                      textShadow: `0 0 20px ${getEmotionColor(selectedRegion.dominantEmotion)}, 0 2px 4px rgba(0,0,0,0.8)`
                    }}
                  >
                    {selectedRegion.name}
                  </h3>
                  <p 
                    className="text-sm opacity-90 text-center"
                    style={{ color: 'white' }}
                  >
                    🔥 헬맵이 분석한 {selectedRegion.name.replace('서울특별시 ', '')}의 감정 상태
                  </p>
                </div>

                {/* Close Button */}
                <Button
                  onClick={() => setSelectedRegion(null)}
                  className="absolute top-3 right-16 w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform backdrop-blur-sm"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    borderColor: 'rgba(255,255,255,0.3)',
                    color: 'white'
                  }}
                >
                  ✕
                </Button>
              </div>
            )}

            <div className="p-6 space-y-6">
              {/* Enhanced Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className="text-center p-4 rounded-xl border-2 relative overflow-hidden group hover:scale-105 transition-transform duration-300"
                  style={{
                    backgroundColor: 'var(--hellmap-darker-bg)',
                    borderColor: 'var(--hellmap-neon-blue)',
                    boxShadow: '0 0 20px rgba(0, 170, 255, 0.2)'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-50"></div>
                  <div 
                    className="text-3xl font-bold mb-2 relative z-10"
                    style={{ 
                      color: 'var(--hellmap-neon-blue)',
                      textShadow: '0 0 10px currentColor'
                    }}
                  >
                    {selectedRegion.totalReports}
                  </div>
                  <div 
                    className="text-sm font-medium relative z-10"
                    style={{ color: 'var(--hellmap-text-secondary)' }}
                  >
                    총 제보
                  </div>
                </div>
                
                <div 
                  className="text-center p-4 rounded-xl border-2 relative overflow-hidden group hover:scale-105 transition-transform duration-300"
                  style={{
                    backgroundColor: 'var(--hellmap-darker-bg)',
                    borderColor: getEmotionColor(selectedRegion.dominantEmotion),
                    boxShadow: `0 0 20px ${getEmotionColor(selectedRegion.dominantEmotion)}40`
                  }}
                >
                  <div 
                    className="absolute inset-0 bg-gradient-to-br opacity-20"
                    style={{
                      background: `linear-gradient(135deg, ${getEmotionColor(selectedRegion.dominantEmotion)}30, transparent)`
                    }}
                  ></div>
                  <div 
                    className="text-3xl font-bold mb-2 relative z-10"
                    style={{ 
                      color: getEmotionColor(selectedRegion.dominantEmotion),
                      textShadow: '0 0 10px currentColor'
                    }}
                  >
                    {selectedRegion.hellLevel}/5
                  </div>
                  <div 
                    className="text-sm font-medium relative z-10"
                    style={{ color: 'var(--hellmap-text-secondary)' }}
                  >
                    지옥도
                  </div>
                </div>
              </div>



              {/* Enhanced Emotion Breakdown */}
              <div>
                <h4 
                  className="text-lg font-bold mb-4 flex items-center gap-2"
                  style={{ 
                    color: 'var(--hellmap-text-primary)',
                    textShadow: '0 0 10px rgba(255, 255, 255, 0.3)'
                  }}
                >
                  📊 감정 분포
                  <div className="text-xs font-normal opacity-70">
                    (총 {selectedRegion.totalReports}개 제보)
                  </div>
                </h4>
                <div className="space-y-4">
                  {Object.entries(selectedRegion.emotionStats).map(([emotion, count]) => {
                    const percentage = selectedRegion.totalReports > 0 
                      ? (count / selectedRegion.totalReports) * 100 
                      : 0;
                    
                    const labels = { SCARY: '개무섭', ANNOYING: '개짜증', FUNNY: '개웃김' };
                    const icons = { SCARY: '😱', ANNOYING: '😤', FUNNY: '🤣' };

                    return (
                      <div key={emotion} className="group">
                        <div className="flex justify-between items-center mb-2">
                          <span 
                            className="text-sm font-medium flex items-center gap-2"
                            style={{ color: 'var(--hellmap-text-secondary)' }}
                          >
                            <span className="text-lg">{icons[emotion as keyof typeof icons]}</span>
                            {labels[emotion as keyof typeof labels]} 
                            <span className="text-xs opacity-70">({count}개)</span>
                          </span>
                          <span 
                            className="text-lg font-bold px-2 py-1 rounded-lg"
                            style={{ 
                              color: getEmotionColor(emotion),
                              backgroundColor: `${getEmotionColor(emotion)}20`,
                              textShadow: '0 0 5px currentColor'
                            }}
                          >
                            {Math.round(percentage)}%
                          </span>
                        </div>
                        <div 
                          className="h-3 rounded-full relative overflow-hidden"
                          style={{ backgroundColor: 'var(--hellmap-border)' }}
                        >
                          <div 
                            className="h-full rounded-full transition-all duration-1000 ease-out relative"
                            style={{ 
                              backgroundColor: getEmotionColor(emotion),
                              width: `${percentage}%`,
                              boxShadow: `0 0 10px ${getEmotionColor(emotion)}60`
                            }}
                          >
                            <div 
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100] p-4"
          style={{ backdropFilter: 'blur(10px)' }}
          onClick={() => setFullscreenImage(null)}
        >
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <Button
              onClick={() => setFullscreenImage(null)}
              className="absolute top-4 right-4 w-12 h-12 rounded-full border-2 hover:scale-110 transition-transform backdrop-blur-sm z-10"
              style={{
                backgroundColor: 'rgba(0,0,0,0.7)',
                borderColor: 'rgba(255,255,255,0.3)',
                color: 'white'
              }}
            >
              ✕
            </Button>

            {/* Image Container */}
            <div 
              className="relative max-w-full max-h-full flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className="rounded-lg shadow-2xl"
                style={{
                  boxShadow: '0 0 80px rgba(255,255,255,0.1), 0 0 40px rgba(255,255,255,0.2)'
                }}
              >
                <ImageWithFallback
                  src={fullscreenImage.url}
                  alt={fullscreenImage.title}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                />
              </div>
              
              {/* Image Info */}
              <div className="mt-6 text-center max-w-2xl">
                <h3 
                  className="text-2xl font-bold mb-2"
                  style={{ 
                    color: 'white',
                    textShadow: '0 0 20px rgba(255,255,255,0.5)'
                  }}
                >
                  {fullscreenImage.title}
                </h3>
                <p 
                  className="text-lg opacity-90"
                  style={{ color: 'rgba(255,255,255,0.8)' }}
                >
                  {fullscreenImage.description}
                </p>
                <div className="mt-4 text-sm opacity-70" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  <p>💡 ESC 키 또는 바깥 영역 클릭으로 닫기</p>
                </div>
              </div>
            </div>

            {/* Background Pattern */}
            <div 
              className="absolute inset-0 opacity-5 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px),
                                  radial-gradient(circle at 75% 75%, white 1px, transparent 1px)`,
                backgroundSize: '50px 50px, 25px 25px',
                animation: 'hellmap-ai-hologram 20s linear infinite'
              }}
            />
          </div>
        </div>
      )}

      {/* Report Detail Modal */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
}