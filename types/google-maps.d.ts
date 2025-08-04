declare interface Window {
  google: {
    maps: {
      places: {
        PlacesService: new (attrContainer: HTMLElement) => {
          textSearch: (request: {
            query: string;
            language?: string;
            region?: string;
          }, callback: (
            results: Array<{
              name: string;
              formatted_address: string;
              geometry: {
                location: {
                  lat: () => number;
                  lng: () => number;
                }
              };
              rating?: number;
              types?: string[];
              place_id: string;
            }> | null,
            status: string
          ) => void) => void;
          getDetails: (request: {
            placeId: string;
            fields: string[];
          }, callback: (
            result: {
              name: string;
              formatted_address: string;
              geometry: {
                location: {
                  lat: () => number;
                  lng: () => number;
                }
              };
              formatted_phone_number?: string;
              website?: string;
              opening_hours?: {
                weekday_text: string[];
              };
            } | null,
            status: string
          ) => void) => void;
        };
        PlacesServiceStatus: {
          OK: string;
          ZERO_RESULTS: string;
          OVER_QUERY_LIMIT: string;
          REQUEST_DENIED: string;
          INVALID_REQUEST: string;
        };
      };
    };
  };
} 