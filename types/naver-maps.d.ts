// 네이버 지도 API 타입 정의
declare global {
  interface Window {
    naver: {
      maps: {
        Map: new (
          element: HTMLElement,
          options: MapOptions,
        ) => NaverMap;
        LatLng: new (lat: number, lng: number) => LatLng;
        Marker: new (options: MarkerOptions) => Marker;
        InfoWindow: new (
          options: InfoWindowOptions,
        ) => InfoWindow;
        Event: {
          addListener: (
            target: any,
            type: string,
            listener: Function,
          ) => any;
          removeListener: (listener: any) => void;
        };
        Service: {
          reverseGeocode: (options: any, callback: Function) => void;
          geocode: (options: any, callback: Function) => void;
          OrderType: {
            ADDR: string;
            ROAD_ADDR: string;
          };
          Status: {
            OK: string;
            ERROR: string;
          };
        };
        Size: new (width: number, height: number) => Size;
        Point: new (x: number, y: number) => Point;
        LatLngBounds: new () => LatLngBounds;
        MapTypeRegistry: {
          set: (key: string, mapType: any) => void;
        };
        MapType: new (key: string, options: any) => any;
        MapTypeId: {
          NORMAL: string;
          TERRAIN: string;
          SATELLITE: string;
          HYBRID: string;
        };
        Position: {
          TOP_LEFT: number;
          TOP_CENTER: number;
          TOP_RIGHT: number;
          LEFT_CENTER: number;
          CENTER: number;
          RIGHT_CENTER: number;
          BOTTOM_LEFT: number;
          BOTTOM_CENTER: number;
          BOTTOM_RIGHT: number;
        };
        MapTypeControlStyle: {
          BUTTON: number;
          DROPDOWN: number;
        };
        ZoomControlStyle: {
          LARGE: number;
          SMALL: number;
        };
      };
    };
  }

  interface MapOptions {
    center?: LatLng;
    zoom?: number;
    mapTypeControl?: boolean;
    mapTypeControlOptions?: {
      style?: number;
      position?: number;
    };
    scaleControl?: boolean;
    logoControl?: boolean;
    mapDataControl?: boolean;
    zoomControl?: boolean;
    zoomControlOptions?: {
      style?: number;
      position?: number;
    };
  }

  interface MarkerOptions {
    position: LatLng;
    map?: NaverMap;
    title?: string;
    icon?:
      | {
          content?: string;
          size?: Size;
          anchor?: Point;
        }
      | string;
    zIndex?: number;
    clickable?: boolean;
  }

  interface InfoWindowOptions {
    content: string;
    maxWidth?: number;
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    anchorSize?: Size;
    anchorSkew?: boolean;
    anchorColor?: string;
    pixelOffset?: Point;
  }

  interface NaverMap {
    setCenter(center: LatLng): void;
    getCenter(): LatLng;
    setZoom(zoom: number): void;
    getZoom(): number;
    setMapTypeId(mapTypeId: string): void;
    getMapTypeId(): string;
    panTo(coord: LatLng): void;
    panBy(x: number, y: number): void;
    fitBounds(bounds: LatLngBounds): void;
    setOptions(options: Partial<MapOptions>): void;
    destroy(): void;
  }

  interface LatLng {
    lat(): number;
    lng(): number;
    toString(): string;
  }

  interface Marker {
    setPosition(position: LatLng): void;
    getPosition(): LatLng;
    setMap(map: NaverMap | null): void;
    getMap(): NaverMap | null;
    setTitle(title: string): void;
    getTitle(): string;
    setIcon(icon: any): void;
    getIcon(): any;
    setZIndex(zIndex: number): void;
    getZIndex(): number;
    setClickable(clickable: boolean): void;
    getClickable(): boolean;
  }

  interface InfoWindow {
    open(map: NaverMap, anchor?: Marker): void;
    close(): void;
    setContent(content: string): void;
    getContent(): string;
    setPosition(position: LatLng): void;
    getPosition(): LatLng;
  }

  interface Size {
    width: number;
    height: number;
  }

  interface Point {
    x: number;
    y: number;
  }

  interface LatLngBounds {
    extend(coord: LatLng): void;
    getCenter(): LatLng;
    getSW(): LatLng;
    getNE(): LatLng;
  }
}

export {};