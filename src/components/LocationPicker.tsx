import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface LocationPickerProps {
  onLocationSelect: (address: string, coordinates: { lat: number; lng: number }, regionCode?: number) => void;
  initialLocation?: string;
  className?: string;
  emotion?: 'SCARY' | 'ANNOYING' | 'FUNNY';  // 감정 타입 추가
}

// 서울시 구별 행정코드 매핑
const SEOUL_DISTRICT_CODES = {
  '서울특별시 강남구': 11680,
  '서울특별시 강동구': 11740,
  '서울특별시 강북구': 11305,
  '서울특별시 강서구': 11500,
  '서울특별시 관악구': 11620,
  '서울특별시 광진구': 11215,
  '서울특별시 구로구': 11530,
  '서울특별시 금천구': 11545,
  '서울특별시 노원구': 11350,
  '서울특별시 도봉구': 11320,
  '서울특별시 동대문구': 11230,
  '서울특별시 동작구': 11590,
  '서울특별시 마포구': 11440,
  '서울특별시 서대문구': 11410,
  '서울특별시 서초구': 11650,
  '서울특별시 성동구': 11200,
  '서울특별시 성북구': 11290,
  '서울특별시 송파구': 11710,
  '서울특별시 양천구': 11470,
  '서울특별시 영등포구': 11560,
  '서울특별시 용산구': 11170,
  '서울특별시 은평구': 11380,
  '서울특별시 종로구': 11110,
  '서울특별시 중구': 11140,
  '서울특별시 중랑구': 11260
} as const;

// 주소에서 구 이름을 추출하는 함수
const extractDistrictFromAddress = (address: string): string | null => {
  const districts = Object.keys(SEOUL_DISTRICT_CODES);
  for (const district of districts) {
    if (address.includes(district)) {
      return district;
    }
  }
  return null;
};

// 구 이름으로 행정코드를 가져오는 함수
const getRegionCode = (address: string): number | undefined => {
  const district = extractDistrictFromAddress(address);
  if (district) {
    return SEOUL_DISTRICT_CODES[district as keyof typeof SEOUL_DISTRICT_CODES];
  }
  return 0;
};

interface SearchResult {
  id: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  rating?: number;
  types?: string[];
}

export function LocationPicker({ onLocationSelect, initialLocation, className, emotion = 'SCARY' }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string;
    coordinates: { lat: number; lng: number };
    region?: string;
  } | null>(null);
  const initialLocationRef = useRef(initialLocation);

  // 감정별 마커 스타일
  const getMarkerIcon = (emotion: 'SCARY' | 'ANNOYING' | 'FUNNY') => {
    const colors = {
      SCARY: '#dc2e7f',    // 분홍색
      ANNOYING: '#f97316',   // 주황색
      FUNNY: '#22c55e'    // 초록색
    };

    const emojis = {
      SCARY: '😱',
      ANNOYING: '😡',
      FUNNY: '😆'
    };

    return {
      content: `
        <div style="
          position: relative;
          width: 32px;
          height: 48px;
          cursor: pointer;
          transform: translate(-50%, -100%);
        ">
          <div style="
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            background-color: white;
            padding: 4px;
            border-radius: 12px;
            font-size: 16px;
            white-space: nowrap;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          ">
            ${emojis[emotion]}
          </div>
          <div style="
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translate(-50%, 0);
            width: 20px;
            height: 20px;
            background: ${colors[emotion]};
            clip-path: polygon(50% 100%, 0 0, 100% 0);
          ">
          </div>
        </div>
      `,
      anchor: new window.naver.maps.Point(16, 48)  // y값을 마커의 실제 높이로 수정
    };
  };

  // 검색 결과 선택 처리
  const handlePlaceSelect = (place: SearchResult) => {
    // 기존 마커 제거
    if (marker) {
      marker.setMap(null);
    }
    markers.forEach(m => m.setMap(null));
    setMarkers([]);

    const position = new window.naver.maps.LatLng(place.location.lat, place.location.lng);
    
    // 새 마커 생성
    const newMarker = new window.naver.maps.Marker({
      position,
      map: map,
      icon: getMarkerIcon(emotion)
    });
    setMarker(newMarker);

    // 지도 이동
    map.setCenter(position);
    map.setZoom(17);

    // 선택한 위치 정보 설정
    const locationInfo = {
      address: place.address,  // 전체 주소 사용
      coordinates: place.location
    };
    setSelectedLocation(locationInfo);
    onLocationSelect(locationInfo.address, locationInfo.coordinates, getRegionCode(locationInfo.address));

    // 검색 결과 초기화
    setSearchResults([]);
    setSearchQuery('');
  };

  // 주소 검색
  const searchAddress = async () => {
    if (!searchQuery.trim() || isSearching) return;

    setIsSearching(true);
    setSearchResults([]);

    try {
      if (!window.google?.maps?.places) {
        console.error('구글 Places API가 로드되지 않았습니다.');
        return;
      }

      // 구글 Places 검색 실행
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      service.textSearch({
        query: searchQuery.trim(),
        language: 'ko',
        region: 'KR',
      }, (results: any, status: any) => {
        setIsSearching(false);
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          const searchResults = results.map((place: any) => ({
            id: place.place_id,
            name: place.name,
            address: place.formatted_address,
            location: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            },
            rating: place.rating,
            types: place.types
          }));

          setSearchResults(searchResults);

          // 검색 결과가 하나면 자동 선택
          if (searchResults.length === 1) {
            handlePlaceSelect(searchResults[0]);
          }
          // 여러 개면 지도에 마커로 표시
          else if (searchResults.length > 1) {
            showSearchResultsOnMap(searchResults);
          }
        } else {
          console.error('검색 실패:', status);
          setSearchResults([]);
        }
      });
    } catch (error) {
      console.error('검색 중 오류:', error);
      setIsSearching(false);
    }
  };

  // 검색 결과를 지도에 표시
  const showSearchResultsOnMap = (results: SearchResult[]) => {
    // 기존 마커 제거
    markers.forEach(m => m.setMap(null));
    if (marker) {
      marker.setMap(null);
      setMarker(null);
    }

    // 새 마커들 생성
    const newMarkers = results.map((result, index) => {
      const position = new window.naver.maps.LatLng(result.location.lat, result.location.lng);
      const newMarker = new window.naver.maps.Marker({
        position,
        map: map,
        icon: {
          content: `
            <div style="
              position: relative;
              width: 32px;
              height: 40px;
              cursor: pointer;
              transform: translate(-50%, -100%);
            ">
              <div style="
                position: absolute;
                top: 0;
                left: 50%;
                transform: translateX(-50%);
                background-color: white;
                color: black;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 12px;
                white-space: nowrap;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
              ">
                ${index + 1}. ${result.name}
              </div>
              <div style="
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 24px;
                height: 24px;
                background-color: white;
                border: 2px solid #dc2e7f;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
              ">
                📍
              </div>
            </div>
          `,
          anchor: new window.naver.maps.Point(16, 32)
        }
      });

      // 마커 클릭 이벤트
      window.naver.maps.Event.addListener(newMarker, 'click', () => {
        handlePlaceSelect(result);
      });

      return newMarker;
    });

    setMarkers(newMarkers);

    // 모든 마커가 보이도록 지도 영역 조정
    if (newMarkers.length > 0) {
      const bounds = new window.naver.maps.LatLngBounds();
      newMarkers.forEach(marker => bounds.extend(marker.getPosition()));
      map.fitBounds(bounds);
    }
  };

  // 지도 초기화
  useEffect(() => {
    if (!mapRef.current || map) return;

    const mapOptions = {
      center: new window.naver.maps.LatLng(37.5666805, 126.9784147),
      zoom: 15,
      mapTypeControl: false,
      scaleControl: false,
      logoControl: false,
      mapDataControl: false,
      zoomControl: false,
      minZoom: 6,
      maxZoom: 21
    };

    const newMap = new window.naver.maps.Map(mapRef.current, mapOptions);
    setMap(newMap);

    // 초기 위치가 있는 경우 지오코딩으로 좌표 검색
    if (initialLocationRef.current) {
      if (!window.google?.maps?.places) {
        console.error('구글 Places API가 로드되지 않았습니다.');
        return;
      }

      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      service.textSearch({
        query: initialLocationRef.current.trim(),
        language: 'ko',
        region: 'KR',
      }, (results: any, status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
          const place = results[0];
          const position = new window.naver.maps.LatLng(
            place.geometry.location.lat(),
            place.geometry.location.lng()
          );
          
          // 지도 이동
          newMap.setCenter(position);
          newMap.setZoom(17);

          // 마커 생성
          const newMarker = new window.naver.maps.Marker({
            position,
            map: newMap,
            icon: getMarkerIcon(emotion)
          });
          setMarker(newMarker);

          // 위치 정보 설정
          const locationInfo = {
            address: place.formatted_address,
            coordinates: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            }
          };
          setSelectedLocation(locationInfo);
          onLocationSelect(locationInfo.address, locationInfo.coordinates, getRegionCode(locationInfo.address));
        }
      });
      return;
    }

    // 현재 위치 가져오기 (초기 위치가 없는 경우)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLocation = new window.naver.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude
          );
          newMap.setCenter(currentLocation);
        },
        () => {
  
        }
      );
    }
  }, [emotion, onLocationSelect]);

  // 지도 클릭 이벤트 설정
  useEffect(() => {
    if (!map) return;

    // 지도 클릭 이벤트 리스너 등록
    const clickListener = window.naver.maps.Event.addListener(map, 'click', async (e: any) => {
      // 클릭한 실제 좌표 사용
      const latlng = e.coord;

      
      // 기존 마커 제거
      if (marker) {
        marker.setMap(null);
      }
      markers.forEach(m => m.setMap(null));
      setMarkers([]);

      // 새 마커 생성
      const newMarker = new window.naver.maps.Marker({
        position: latlng,
        map: map,
        icon: {
          content: `
            <div style="
              position: relative;
              width: 32px;
              height: 32px;
              cursor: pointer;
            ">
              <div style="
                position: absolute;
                top: -24px;
                left: 50%;
                transform: translateX(-50%);
                background-color: white;
                padding: 4px;
                border-radius: 12px;
                font-size: 16px;
                white-space: nowrap;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
                z-index: 1;
              ">
                ${emotion === 'SCARY' ? '😱' : emotion === 'ANNOYING' ? '😡' : '😆'}
              </div>
              <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 24px;
                height: 24px;
                background-color: white;
                border: 2px solid ${emotion === 'SCARY' ? '#dc2e7f' : emotion === 'ANNOYING' ? '#f97316' : '#22c55e'};
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
              ">
                📍
              </div>
            </div>
          `,
          anchor: new window.naver.maps.Point(16, 16)
        }
      });
      setMarker(newMarker);

      // 좌표를 주소로 변환
      try {
        if (!window.naver.maps.Service) {
          throw new Error('네이버 지도 Service 모듈이 로드되지 않았습니다.');
        }

        window.naver.maps.Service.reverseGeocode({
          coords: latlng,
          orders: [
            window.naver.maps.Service.OrderType.ADDR,
            window.naver.maps.Service.OrderType.ROAD_ADDR
          ].join(',')
        }, (status: any, response: any) => {
          if (status === window.naver.maps.Service.Status.ERROR) {
            throw new Error('주소 변환 실패');
          }

          if (!response?.v2?.address) {
            throw new Error('주소를 찾을 수 없습니다.');
          }

          const result = response.v2.address;

          // 주소 구성 요소 추출 및 정제
          const area1 = result.sido || '';
          const area2 = result.sigugun || '';
          const area3 = result.dongmyun || '';
          const rest = result.rest || '';
          
          // 도로명 주소나 지번 주소가 있는 경우
          let address = '';
          if (result.roadAddress) {
            address = result.roadAddress;
          } else if (result.jibunAddress) {
            address = result.jibunAddress;
          } else {
            // 도로명/지번 주소가 없는 경우 행정구역 정보로 구성
            const addressParts = [area1, area2, area3];
            if (rest && !rest.includes('undefined')) {
              addressParts.push(rest);
            }
            address = addressParts.filter(part => part && part !== 'undefined').join(' ');
          }

          // 지역 정보 구성 (행정구역 정보만 포함)
          const regionParts = [area1, area2, area3];
          const region = regionParts.filter(part => part && part !== 'undefined').join(' ');

          // 주소가 너무 짧거나 없는 경우
          if (!address || address.length < 2) {
            address = '주소를 찾을 수 없는 위치';
          }

          const locationInfo = {
            address,
            coordinates: { lat: latlng.y, lng: latlng.x },
            region: region || '지역 정보 없음'
          };

          const regionCode = getRegionCode(locationInfo.address);
          
          setSelectedLocation(locationInfo);
          onLocationSelect(locationInfo.address, locationInfo.coordinates, regionCode);
        });
      } catch (error) {
        console.error('주소 변환 중 오류:', error);
        
        // 에러 발생 시에도 좌표 정보는 유지
        const locationInfo = {
          address: '주소를 찾을 수 없는 위치',
          coordinates: { lat: latlng.y, lng: latlng.x },
          region: '지역 정보 없음'
        };
        
        setSelectedLocation(locationInfo);
        onLocationSelect(locationInfo.address, locationInfo.coordinates, getRegionCode(locationInfo.address));
      }
    });

    return () => {
      // 이벤트 리스너 제거
      if (clickListener) {
        window.naver.maps.Event.removeListener(clickListener);
      }
    };
  }, [map, marker, markers, emotion, onLocationSelect]);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 위치 선택 안내 */}
      <div 
        className="p-3 rounded-lg border"
        style={{
          backgroundColor: 'var(--hellmap-darker-bg)',
          borderColor: 'var(--hellmap-neon-blue)',
          borderStyle: 'dashed'
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">📍</span>
          <span 
            className="text-sm font-medium"
            style={{ color: 'var(--hellmap-neon-blue)' }}
          >
            위치 선택 ({selectedLocation ? '1/1' : '0/1'})
          </span>
        </div>
        <p 
          className="text-xs leading-relaxed"
          style={{ color: 'var(--hellmap-text-muted)' }}
        >
          제보할 위치를 <strong>한 곳</strong>만 선택해주세요.<br/>
          검색하거나 지도를 직접 클릭하여 정확한 위치를 지정할 수 있습니다.
        </p>
      </div>

      {/* 검색 영역 */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchAddress()}
            placeholder="장소 검색 (예: 롯데월드, 어린이대공원역)"
            className="flex-1 p-2.5 sm:p-3 rounded-lg border-2 transition-all text-sm sm:text-base"
            style={{
              backgroundColor: 'var(--hellmap-darker-bg)',
              borderColor: searchQuery.trim() ? 'var(--hellmap-neon-green)' : 'var(--hellmap-border)',
              color: 'var(--hellmap-text-primary)'
            }}
          />
          <Button
            onClick={searchAddress}
            disabled={!searchQuery.trim() || isSearching}
            className="px-4 py-2.5 sm:py-3 rounded-lg border-2 transition-all hover:scale-105"
            style={{
              backgroundColor: !searchQuery.trim() || isSearching ? 'var(--hellmap-border)' : 'var(--hellmap-neon-blue)',
              borderColor: !searchQuery.trim() || isSearching ? 'var(--hellmap-border)' : 'var(--hellmap-neon-blue)',
              color: !searchQuery.trim() || isSearching ? 'var(--hellmap-text-muted)' : 'black'
            }}
          >
            {isSearching ? (
              <div className="w-4 h-4 rounded-full animate-spin border-2 border-transparent border-t-current" />
            ) : (
              '🔍'
            )}
          </Button>
        </div>

        {/* 검색 결과 목록 */}
        {searchResults.length > 0 && (
          <div className="border rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--hellmap-darker-bg)', borderColor: 'var(--hellmap-neon-green)' }}>
            <div className="p-2 text-xs font-medium border-b" style={{ backgroundColor: 'var(--hellmap-neon-green)', color: 'black', borderColor: 'var(--hellmap-border)' }}>
              🔍 검색된 장소 ({searchResults.length}개)
            </div>
            <div className="max-h-48 overflow-y-auto hellmap-scroll">
              {searchResults.map((place, index) => (
                <button
                  key={place.id}
                  onClick={() => handlePlaceSelect(place)}
                  className="w-full p-3 text-left hover:bg-opacity-80 transition-all border-b last:border-b-0 group"
                  style={{ backgroundColor: 'transparent', borderColor: 'var(--hellmap-border)', color: 'var(--hellmap-text-primary)' }}
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold group-hover:scale-110 transition-transform flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: '#00ff88', color: 'black' }}
                    >
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium mb-1 truncate">
                        {place.name}
                      </div>
                      <div className="text-sm truncate" style={{ color: 'var(--hellmap-text-secondary)' }}>
                        {place.address}
                      </div>
                      {place.rating && (
                        <div className="mt-1 text-xs" style={{ color: 'var(--hellmap-text-muted)' }}>
                          ⭐ {place.rating.toFixed(1)}
                        </div>
                      )}
                    </div>
                    <span className="text-lg group-hover:scale-125 transition-transform flex-shrink-0">📍</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 지도 */}
      <div className="relative">
        <div 
          ref={mapRef}
          className="w-full h-48 sm:h-56 rounded-lg border-2 overflow-hidden transition-all"
          style={{
            backgroundColor: 'var(--hellmap-darker-bg)',
            borderColor: selectedLocation ? 'var(--hellmap-neon-blue)' : 'var(--hellmap-border)'
          }}
        />

        {/* 지도 위 버튼들 */}
        <div className="absolute top-2 left-2 space-y-2">
          {/* 현재 위치 버튼 */}
          <Button
            onClick={() => {
              if (navigator.geolocation && map) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    const currentLocation = new window.naver.maps.LatLng(
                      position.coords.latitude,
                      position.coords.longitude
                    );
                    map.setCenter(currentLocation);
                    map.setZoom(17);
                  },
                  () => {
                    alert('현재 위치를 가져올 수 없습니다.');
                  }
                );
              }
            }}
            className="w-10 h-10 p-0 rounded-full border backdrop-blur-sm hover:scale-110 transition-all"
            style={{
              backgroundColor: 'rgba(0, 122, 255, 0.9)',
              borderColor: 'white',
              color: 'white'
            }}
            title="내 위치로 이동"
          >
            🧭
          </Button>

          {/* 선택 초기화 버튼 */}
          {selectedLocation && (
            <Button
              onClick={() => {
                // 마커 제거
                if (marker) {
                  marker.setMap(null);
                  setMarker(null);
                }
                markers.forEach(m => m.setMap(null));
                setMarkers([]);

                // 상태 초기화
                setSelectedLocation(null);
                onLocationSelect('', { lat: 0, lng: 0 }, undefined);
                setSearchResults([]);
                setSearchQuery('');
              }}
              className="w-10 h-10 p-0 rounded-full border backdrop-blur-sm hover:scale-110 transition-all"
              style={{
                backgroundColor: 'rgba(220, 38, 127, 0.9)',
                borderColor: 'white',
                color: 'white'
              }}
              title="선택 초기화"
            >
              🗑️
            </Button>
          )}
        </div>

        {/* 지도 사용법 안내 */}
        {!selectedLocation && searchResults.length === 0 && (
          <div className="absolute top-2 right-2">
            <div 
              className="p-2 rounded-lg backdrop-blur-sm border"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                borderColor: 'var(--hellmap-border)',
                color: 'var(--hellmap-text-muted)'
              }}
            >
              <p className="text-xs text-center">
                🖱️ 지도 클릭으로<br/>위치 선택
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 선택된 위치 정보 */}
      {selectedLocation && (
        <div 
          className="p-4 rounded-lg border-2 hellmap-card-glow"
          style={{
            backgroundColor: 'var(--hellmap-darker-bg)',
            borderColor: 'var(--hellmap-neon-blue)'
          }}
        >
          <div className="flex items-start gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--hellmap-neon-blue)' }}
            >
              <span className="text-black text-lg">📍</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p 
                  className="text-sm font-medium"
                  style={{ color: 'var(--hellmap-neon-blue)' }}
                >
                  ✅ 위치가 선택되었습니다
                </p>
                <div 
                  className="px-2 py-1 rounded-full text-xs"
                  style={{ 
                    backgroundColor: 'var(--hellmap-neon-green)',
                    color: 'black'
                  }}
                >
                  1/1
                </div>
              </div>
              <p 
                className="text-sm leading-relaxed"
                style={{ color: 'var(--hellmap-text-primary)' }}
              >
                {selectedLocation.address}
              </p>
              {/* 서울 외 지역 베타 테스트 안내 */}
              {getRegionCode(selectedLocation.address) === 0 && (
                <div 
                  className="mt-2 p-2 rounded-lg border"
                  style={{
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    borderColor: '#ffc107',
                    color: '#ffc107'
                  }}
                >
                  <div className="flex items-center gap-1 text-xs">
                    <span>🚧</span>
                    <span className="font-medium">서울 외 지역 베타 테스트 중</span>
                  </div>
                  <p className="text-xs mt-1 opacity-80">
                    현재 이 지역은 서울 지역 밖으로, 지역 마커는 표시되지 않지만 제보는 정상적으로 등록됩니다.
                  </p>
                </div>
              )}
              <p 
                className="text-xs mt-2 opacity-70"
                style={{ color: 'var(--hellmap-text-muted)' }}
              >
                좌표: {selectedLocation.coordinates.lat.toFixed(6)}, {selectedLocation.coordinates.lng.toFixed(6)}
              </p>
            </div>
            <Button
              onClick={() => {
                // 마커 제거
                if (marker) {
                  marker.setMap(null);
                  setMarker(null);
                }
                markers.forEach(m => m.setMap(null));
                setMarkers([]);

                // 상태 초기화
                setSelectedLocation(null);
                onLocationSelect('', { lat: 0, lng: 0 }, undefined);
                setSearchResults([]);
                setSearchQuery('');
              }}
              className="w-8 h-8 p-0 rounded-full border hover:scale-110 transition-all flex-shrink-0"
              style={{
                backgroundColor: 'transparent',
                borderColor: 'var(--hellmap-border)',
                color: 'var(--hellmap-text-muted)'
              }}
              title="선택 취소"
            >
              ✕
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 