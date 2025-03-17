import axios from 'axios';

// Define types for location data
export interface LocationSuggestion {
  description: string;
  lat: number;
  lng: number;
}

export interface DirectionsResult {
  distance: number;
  duration: number;
  waypoints: Array<{lat: number; lng: number}>;
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

/**
 * Service for handling location-related operations on the frontend
 */
class LocationService {
  /**
   * Get location suggestions from the backend
   * @param query The search query
   * @returns A promise with location suggestions
   */
  async getSuggestions(query: string): Promise<LocationSuggestion[]> {
    try {
      // In a real implementation, this would call the backend API
      // const response = await axios.get(`${API_BASE_URL}/api/locations/suggestions`, {
      //   params: { query }
      // });
      // return response.data;
      
      // For demo purposes, generate suggestions client-side
      return this.generateClientSideSuggestions(query);
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      return []; // Return empty array on error
    }
  }
  
  /**
   * Get directions between two points
   * @param origin Origin coordinates
   * @param destination Destination coordinates
   * @returns A promise with directions data
   */
  async getDirections(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): Promise<DirectionsResult> {
    try {
      // In a real implementation, this would call the backend API
      // const response = await axios.get(`${API_BASE_URL}/api/locations/directions`, {
      //   params: {
      //     originLat: origin.lat,
      //     originLng: origin.lng,
      //     destLat: destination.lat,
      //     destLng: destination.lng
      //   }
      // });
      // return response.data;
      
      // For demo purposes, generate directions client-side
      return this.generateClientSideDirections(origin, destination);
    } catch (error) {
      console.error('Error fetching directions:', error);
      return {
        distance: 0,
        duration: 0,
        waypoints: []
      };
    }
  }
  
  /**
   * Generate client-side suggestions for demo purposes
   * @param query The search query
   * @returns An array of location suggestions
   */
  private generateClientSideSuggestions(query: string): LocationSuggestion[] {
    if (!query || query.length < 2) return [];
    
    const queryLower = query.toLowerCase().trim();
    
    // Handle Reem Island and similar locations in UAE
    if (this.isPartialMatch(queryLower, ['reem', 'rem', 'riim', 'rim'])) {
      return [
        {
          description: 'Reem Island, Abu Dhabi, UAE',
          lat: 24.4991, lng: 54.4017
        },
        {
          description: 'Reem Mall, Reem Island, Abu Dhabi, UAE',
          lat: 24.5038, lng: 54.4066
        },
        {
          description: 'Reem Village, Reem Island, Abu Dhabi, UAE',
          lat: 24.4924, lng: 54.3972
        }
      ];
    }
    
    // Handle common typos for Abu Dhabi
    if (this.isPartialMatch(queryLower, ['abu', 'dbu', 'abo', 'dhabi', 'dha'])) {
      return [
        {
          description: 'Abu Dhabi Corniche, Abu Dhabi, UAE',
          lat: 24.4672, lng: 54.3567
        },
        {
          description: 'Abu Dhabi Mall, Abu Dhabi, UAE',
          lat: 24.4979, lng: 54.3809
        },
        {
          description: 'Sheikh Zayed Grand Mosque, Abu Dhabi, UAE',
          lat: 24.4128, lng: 54.4750
        },
        {
          description: 'Abu Dhabi, UAE',
          lat: 24.4539, lng: 54.3773
        }
      ];
    }
    
    // Handle Dubai searches with typo tolerance
    if (this.isPartialMatch(queryLower, ['dubai', 'dubei', 'duabi', 'dubi'])) {
      return [
        {
          description: 'Dubai Mall, Dubai, UAE',
          lat: 25.1972, lng: 55.2744
        },
        {
          description: 'Burj Khalifa, Dubai, UAE',
          lat: 25.1972, lng: 55.2740
        },
        {
          description: 'Dubai Marina, Dubai, UAE',
          lat: 25.0763, lng: 55.1304
        },
        {
          description: 'Dubai, UAE',
          lat: 25.2048, lng: 55.2708
        }
      ];
    }
    
    // Handle other popular UAE locations
    if (this.isPartialMatch(queryLower, ['saadiyat', 'sadiyat'])) {
      return [
        {
          description: 'Saadiyat Island, Abu Dhabi, UAE',
          lat: 24.5456, lng: 54.4218
        },
        {
          description: 'Saadiyat Beach, Abu Dhabi, UAE',
          lat: 24.5476, lng: 54.4232
        },
        {
          description: 'Louvre Abu Dhabi, Saadiyat Island, UAE',
          lat: 24.5366, lng: 54.3984
        }
      ];
    }
    
    if (this.isPartialMatch(queryLower, ['yas', 'yas island'])) {
      return [
        {
          description: 'Yas Island, Abu Dhabi, UAE',
          lat: 24.4959, lng: 54.6056
        },
        {
          description: 'Yas Mall, Abu Dhabi, UAE',
          lat: 24.4913, lng: 54.6068
        },
        {
          description: 'Ferrari World, Yas Island, Abu Dhabi, UAE',
          lat: 24.4831, lng: 54.6036
        }
      ];
    }
    
    // Handle China searches
    if (this.isPartialMatch(queryLower, ['china', 'chna'])) {
      return [
        {
          description: 'Beijing, China',
          lat: 39.9042, lng: 116.4074
        },
        {
          description: 'Shanghai, China',
          lat: 31.2304, lng: 121.4737
        },
        {
          description: 'Hong Kong, China',
          lat: 22.3193, lng: 114.1694
        }
      ];
    }
    
    // Real locations based on first letter for other searches
    const firstChar = queryLower.charAt(0);
    
    if ('abc'.includes(firstChar)) {
      // Real locations for 'A', 'B', 'C' starting places
      return [
        {
          description: 'Atlanta, Georgia, USA',
          lat: 33.7490, lng: -84.3880
        },
        {
          description: 'Boston, Massachusetts, USA',
          lat: 42.3601, lng: -71.0589
        },
        {
          description: 'Chicago, Illinois, USA',
          lat: 41.8781, lng: -87.6298
        }
      ];
    } else if ('def'.includes(firstChar)) {
      return [
        {
          description: 'Delhi, India',
          lat: 28.7041, lng: 77.1025
        },
        {
          description: 'Dubai, UAE',
          lat: 25.2048, lng: 55.2708
        },
        {
          description: 'Frankfurt, Germany',
          lat: 50.1109, lng: 8.6821
        }
      ];
    }
    
    // Default to major world cities
    return [
      {
        description: 'London, UK',
        lat: 51.5074, lng: -0.1278
      },
      {
        description: 'New York, USA',
        lat: 40.7128, lng: -74.0060
      },
      {
        description: 'Tokyo, Japan',
        lat: 35.6762, lng: 139.6503
      }
    ];
  }
  
  /**
   * Check if a query partially matches any of the terms
   * @param query The query to check
   * @param terms The terms to match against
   * @returns True if the query matches any term
   */
  private isPartialMatch(query: string, terms: string[]): boolean {
    return terms.some(term => 
      query.includes(term) || term.includes(query)
    );
  }
  
  /**
   * Generate client-side directions for demo purposes
   * @param origin Origin coordinates
   * @param destination Destination coordinates
   * @returns Directions result
   */
  private generateClientSideDirections(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): DirectionsResult {
    // Calculate direct distance using Haversine formula
    const directDistance = this.calculateHaversineDistance(
      origin.lat, origin.lng, 
      destination.lat, destination.lng
    );
    
    // Real-world routes are typically 20-40% longer than direct distance
    const routeFactor = 1.2 + Math.random() * 0.2; // Between 1.2 and 1.4
    const distance = directDistance * routeFactor;
    
    // Estimate duration (assuming average 30 mph)
    const duration = Math.round(distance * 2); // 2 minutes per mile
    
    // Generate waypoints (simplified)
    const waypoints: Array<{lat: number; lng: number}> = this.generateWaypoints(
      origin, destination, 8
    );
    
    return {
      distance,
      duration,
      waypoints
    };
  }
  
  /**
   * Calculate distance between two points using Haversine formula
   */
  private calculateHaversineDistance(
    lat1: number, lng1: number, 
    lat2: number, lng2: number
  ): number {
    const R = 3958.8; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance;
  }
  
  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
  
  /**
   * Generate waypoints between two points
   * @param start Start coordinates
   * @param end End coordinates
   * @param numPoints Number of points to generate
   * @returns Array of waypoints
   */
  private generateWaypoints(
    start: { lat: number; lng: number },
    end: { lat: number; lng: number },
    numPoints: number
  ): Array<{lat: number; lng: number}> {
    const waypoints: Array<{lat: number; lng: number}> = [{ ...start }];
    
    // Add some randomness to make it look like a real route
    const perpFactor = 0.3;
    const dLat = end.lat - start.lat;
    const dLng = end.lng - start.lng;
    
    // Calculate perpendicular offset
    const perpLat = -dLng * perpFactor;
    const perpLng = dLat * perpFactor;
    
    // Create control points for the curve
    const ctrl1 = {
      lat: start.lat + (dLat / 3) + (perpLat / 2),
      lng: start.lng + (dLng / 3) + (perpLng / 2)
    };
    
    const ctrl2 = {
      lat: start.lat + (dLat / 2) + perpLat,
      lng: start.lng + (dLng / 2) + perpLng
    };
    
    const ctrl3 = {
      lat: start.lat + (2 * dLat / 3) + (perpLat / 2),
      lng: start.lng + (2 * dLng / 3) + (perpLng / 2)
    };
    
    // Generate points along a bezier-like curve
    for (let i = 1; i < numPoints - 1; i++) {
      const t = i / (numPoints - 1);
      
      // Simple way to simulate a curved path
      let lat, lng;
      
      if (t < 0.3) {
        // First segment - interpolate between start and ctrl1
        const segmentT = t / 0.3;
        lat = start.lat + segmentT * (ctrl1.lat - start.lat);
        lng = start.lng + segmentT * (ctrl1.lng - start.lng);
      } else if (t < 0.5) {
        // Second segment - interpolate between ctrl1 and ctrl2
        const segmentT = (t - 0.3) / 0.2;
        lat = ctrl1.lat + segmentT * (ctrl2.lat - ctrl1.lat);
        lng = ctrl1.lng + segmentT * (ctrl2.lng - ctrl1.lng);
      } else if (t < 0.7) {
        // Third segment - interpolate between ctrl2 and ctrl3
        const segmentT = (t - 0.5) / 0.2;
        lat = ctrl2.lat + segmentT * (ctrl3.lat - ctrl2.lat);
        lng = ctrl2.lng + segmentT * (ctrl3.lng - ctrl2.lng);
      } else {
        // Final segment - interpolate between ctrl3 and end
        const segmentT = (t - 0.7) / 0.3;
        lat = ctrl3.lat + segmentT * (end.lat - ctrl3.lat);
        lng = ctrl3.lng + segmentT * (end.lng - ctrl3.lng);
      }
      
      // Add some small random noise to make it look like a road
      const noise = 0.0005;
      lat += (Math.random() - 0.5) * noise;
      lng += (Math.random() - 0.5) * noise;
      
      waypoints.push({ lat, lng });
    }
    
    // Add the destination point
    waypoints.push({ ...end });
    
    return waypoints;
  }
}

// Create and export a singleton instance
const locationService = new LocationService();
export default locationService; 