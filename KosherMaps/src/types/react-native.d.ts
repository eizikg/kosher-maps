declare global {
  interface Navigator {
    geolocation: {
      getCurrentPosition(
        success: (position: {
          coords: {
            latitude: number;
            longitude: number;
            accuracy: number;
            altitude?: number | null;
            altitudeAccuracy?: number | null;
            heading?: number | null;
            speed?: number | null;
          };
          timestamp: number;
        }) => void,
        error?: (error: {
          code: number;
          message: string;
        }) => void,
        options?: {
          enableHighAccuracy?: boolean;
          timeout?: number;
          maximumAge?: number;
        }
      ): void;
      
      watchPosition(
        success: (position: {
          coords: {
            latitude: number;
            longitude: number;
            accuracy: number;
            altitude?: number | null;
            altitudeAccuracy?: number | null;
            heading?: number | null;
            speed?: number | null;
          };
          timestamp: number;
        }) => void,
        error?: (error: {
          code: number;
          message: string;
        }) => void,
        options?: {
          enableHighAccuracy?: boolean;
          timeout?: number;
          maximumAge?: number;
          distanceFilter?: number;
          interval?: number;
        }
      ): number;
      
      clearWatch(watchId: number): void;
    };
  }
  
  const navigator: Navigator;
}

export {};