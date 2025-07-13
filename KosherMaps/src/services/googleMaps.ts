import Config from 'react-native-config';
import Geolocation from '@react-native-community/geolocation';
import { Coordinates, Address, Place, Route } from '../types';
import { API_ENDPOINTS } from '../utils/constants';

export class GoogleMapsService {
  private static apiKey = Config.GOOGLE_MAPS_API_KEY;

  private static async makeRequest(url: string, params: Record<string, any>): Promise<any> {
    const queryParams = new URLSearchParams({
      ...params,
      key: this.apiKey || '',
    });

    const response = await fetch(`${url}?${queryParams}`);
    
    if (!response.ok) {
      throw new Error(`Google Maps API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Maps API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }

    return data;
  }

  static async geocode(address: string): Promise<Coordinates> {
    try {
      const data = await this.makeRequest(API_ENDPOINTS.GEOCODING, {
        address: encodeURIComponent(address),
      });

      if (data.results.length === 0) {
        throw new Error('No results found for the given address');
      }

      const location = data.results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng,
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  }

  static async reverseGeocode(coordinates: Coordinates): Promise<Address> {
    try {
      const data = await this.makeRequest(API_ENDPOINTS.GEOCODING, {
        latlng: `${coordinates.latitude},${coordinates.longitude}`,
      });

      if (data.results.length === 0) {
        throw new Error('No address found for the given coordinates');
      }

      const result = data.results[0];
      const components = result.address_components || [];

      // Parse address components
      const getComponent = (types: string[]) => {
        const component = components.find((comp: any) =>
          types.some((type: string) => comp.types.includes(type))
        );
        return component?.long_name || '';
      };

      return {
        formattedAddress: result.formatted_address,
        streetNumber: getComponent(['street_number']),
        streetName: getComponent(['route']),
        city: getComponent(['locality', 'sublocality']),
        state: getComponent(['administrative_area_level_1']),
        postalCode: getComponent(['postal_code']),
        country: getComponent(['country']),
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw error;
    }
  }

  static async getDirections(
    origin: Coordinates,
    destination: Coordinates,
    mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving'
  ): Promise<Route[]> {
    try {
      const data = await this.makeRequest(API_ENDPOINTS.DIRECTIONS, {
        origin: `${origin.latitude},${origin.longitude}`,
        destination: `${destination.latitude},${destination.longitude}`,
        mode,
        alternatives: true,
        traffic_model: mode === 'driving' ? 'best_guess' : undefined,
        departure_time: mode === 'driving' ? 'now' : undefined,
      });

      if (data.routes.length === 0) {
        throw new Error('No routes found');
      }

      return data.routes.map((route: any, index: number) => {
        const leg = route.legs[0];
        return {
          id: `route_${index}`,
          distance: leg.distance.value,
          duration: leg.duration.value,
          polyline: route.overview_polyline.points,
          steps: leg.steps.map((step: any) => ({
            instruction: step.html_instructions.replace(/<[^>]*>/g, ''), // Remove HTML tags
            distance: step.distance.value,
            duration: step.duration.value,
            startLocation: {
              latitude: step.start_location.lat,
              longitude: step.start_location.lng,
            },
            endLocation: {
              latitude: step.end_location.lat,
              longitude: step.end_location.lng,
            },
            maneuver: step.maneuver,
          })),
          bounds: {
            northeast: {
              latitude: route.bounds.northeast.lat,
              longitude: route.bounds.northeast.lng,
            },
            southwest: {
              latitude: route.bounds.southwest.lat,
              longitude: route.bounds.southwest.lng,
            },
          },
        };
      });
    } catch (error) {
      console.error('Directions error:', error);
      throw error;
    }
  }

  static async searchPlaces(
    query: string,
    location?: Coordinates,
    radius?: number
  ): Promise<Place[]> {
    try {
      const params: Record<string, any> = {
        input: encodeURIComponent(query),
        inputtype: 'textquery',
        fields: 'place_id,name,formatted_address,geometry,types',
      };

      if (location) {
        params.locationbias = `circle:${radius || 50000}@${location.latitude},${location.longitude}`;
      }

      const data = await this.makeRequest(API_ENDPOINTS.PLACES_AUTOCOMPLETE, params);

      return data.predictions?.map((prediction: any) => ({
        id: prediction.place_id,
        name: prediction.structured_formatting?.main_text || prediction.description,
        address: prediction.description,
        coordinates: {
          latitude: 0, // Will be fetched when needed
          longitude: 0,
        },
        types: prediction.types,
      })) || [];
    } catch (error) {
      console.error('Places search error:', error);
      throw error;
    }
  }

  static async getPlaceDetails(placeId: string): Promise<Place> {
    try {
      const data = await this.makeRequest(API_ENDPOINTS.PLACES_DETAILS, {
        place_id: placeId,
        fields: 'place_id,name,formatted_address,geometry,types',
      });

      const place = data.result;
      return {
        id: place.place_id,
        name: place.name,
        address: place.formatted_address,
        coordinates: {
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
        },
        types: place.types,
      };
    } catch (error) {
      console.error('Place details error:', error);
      throw error;
    }
  }

  static async getCurrentLocation(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Location error:', error);
          reject(new Error(`Location error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }

  static watchLocation(
    callback: (location: Coordinates) => void,
    errorCallback?: (error: Error) => void
  ): number {
    return Geolocation.watchPosition(
      (position) => {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error('Location watch error:', error);
        errorCallback?.(new Error(`Location watch error: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // Update every 10 meters
        interval: 5000, // Update every 5 seconds
      }
    );
  }

  static clearLocationWatch(watchId: number): void {
    Geolocation.clearWatch(watchId);
  }
}