/**
 * Emergency Hospital Locator Service
 * Provides:
 * - GPS-based nearest hospital discovery using Haversine geodesic calculations
 * - Estimated transit/ambulance transit time based on distance
 * - 24/7 Emergency Casualty Department direct dial numbers (+91)
 * - Specialized capabilities tagging (Level 1 Trauma, ICU, Cath Lab, Pediatric Emergency, Blood Bank)
 * - 1-tap Google Maps Navigation & Directions deep links
 */

import { formatIndianPhoneNumber, toDialablePhone } from '../utils/phoneUtils';

export interface EmergencyHospital {
  id: string;
  name: string;
  type: 'Trauma Center' | 'Super Specialty' | 'Tertiary Hospital' | 'Government Medical College' | 'Multispecialty' | 'District Hospital';
  traumaLevel: 'Level 1 Trauma Center' | 'Level 2 Trauma Center' | '24/7 Emergency & Critical Care';
  address: string;
  city: string;
  state: string;
  emergencyPhone: string;
  ambulancePhone: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  distanceKm: number;
  estimatedTransitMinutes: number;
  open24_7: boolean;
  hasIcu: boolean;
  hasCathLab: boolean;
  hasPediatricEmergency: boolean;
  hasBloodBank: boolean;
  rating: number;
  verifiedEmergencyDesk: boolean;
}

// Curated reference database of major accredited emergency trauma centers
const HOSPITAL_DIRECTORY: Omit<EmergencyHospital, 'distanceKm' | 'estimatedTransitMinutes'>[] = [
  // Kolkata / Hooghly / Bengal Region (Matching patient's current coordinate cluster 22.92°N, 88.37°E)
  {
    id: 'hosp-kol-1',
    name: 'Hooghly District Hospital & Emergency Trauma Unit',
    type: 'Trauma Center',
    traumaLevel: 'Level 1 Trauma Center',
    address: 'Grand Trunk Road, Chinsurah',
    city: 'Hooghly',
    state: 'West Bengal',
    emergencyPhone: '+91 33 2680 2314',
    ambulancePhone: '108',
    coordinates: { lat: 22.9028, lng: 88.3965 },
    open24_7: true,
    hasIcu: true,
    hasCathLab: false,
    hasPediatricEmergency: true,
    hasBloodBank: true,
    rating: 4.4,
    verifiedEmergencyDesk: true
  },
  {
    id: 'hosp-kol-2',
    name: 'Apollo Multispeciality Hospitals (EM Bypass)',
    type: 'Super Specialty',
    traumaLevel: 'Level 1 Trauma Center',
    address: '58 Canal Circular Road, Kadapara, Phool Bagan',
    city: 'Kolkata',
    state: 'West Bengal',
    emergencyPhone: '+91 33 2320 2122',
    ambulancePhone: '+91 33 2320 3040',
    coordinates: { lat: 22.5697, lng: 88.4011 },
    open24_7: true,
    hasIcu: true,
    hasCathLab: true,
    hasPediatricEmergency: true,
    hasBloodBank: true,
    rating: 4.8,
    verifiedEmergencyDesk: true
  },
  {
    id: 'hosp-kol-3',
    name: 'Medical College & Hospital Trauma Care Centre',
    type: 'Government Medical College',
    traumaLevel: 'Level 1 Trauma Center',
    address: '88 College Street, College Square',
    city: 'Kolkata',
    state: 'West Bengal',
    emergencyPhone: '+91 33 2255 1621',
    ambulancePhone: '108',
    coordinates: { lat: 22.5744, lng: 88.3629 },
    open24_7: true,
    hasIcu: true,
    hasCathLab: true,
    hasPediatricEmergency: true,
    hasBloodBank: true,
    rating: 4.6,
    verifiedEmergencyDesk: true
  },
  {
    id: 'hosp-kol-4',
    name: 'AMRI Hospitals & Emergency Casualty (Salt Lake)',
    type: 'Super Specialty',
    traumaLevel: 'Level 2 Trauma Center',
    address: 'JC-16 & 17, Sector III, Bidhannagar',
    city: 'Kolkata',
    state: 'West Bengal',
    emergencyPhone: '+91 33 6606 3800',
    ambulancePhone: '+91 33 2335 7700',
    coordinates: { lat: 22.5702, lng: 88.4069 },
    open24_7: true,
    hasIcu: true,
    hasCathLab: true,
    hasPediatricEmergency: false,
    hasBloodBank: true,
    rating: 4.5,
    verifiedEmergencyDesk: true
  },
  {
    id: 'hosp-kol-5',
    name: 'Fortis Hospital & Kidney Institute',
    type: 'Super Specialty',
    traumaLevel: '24/7 Emergency & Critical Care',
    address: '730 Anandapur, E.M. Bypass Road',
    city: 'Kolkata',
    state: 'West Bengal',
    emergencyPhone: '+91 33 6628 4444',
    ambulancePhone: '108',
    coordinates: { lat: 22.5186, lng: 88.4002 },
    open24_7: true,
    hasIcu: true,
    hasCathLab: true,
    hasPediatricEmergency: true,
    hasBloodBank: true,
    rating: 4.7,
    verifiedEmergencyDesk: true
  },

  // Mumbai / Maharashtra Region (Matching patient's registered residential profile in Bandra)
  {
    id: 'hosp-mum-1',
    name: 'Lilavati Hospital & Research Centre',
    type: 'Super Specialty',
    traumaLevel: 'Level 1 Trauma Center',
    address: 'A-791, Bandra Reclamation, Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    emergencyPhone: '+91 22 2640 5110',
    ambulancePhone: '+91 22 2675 1000',
    coordinates: { lat: 19.0519, lng: 72.8291 },
    open24_7: true,
    hasIcu: true,
    hasCathLab: true,
    hasPediatricEmergency: true,
    hasBloodBank: true,
    rating: 4.8,
    verifiedEmergencyDesk: true
  },
  {
    id: 'hosp-mum-2',
    name: 'Hinduja Hospital & Emergency Medical Services',
    type: 'Super Specialty',
    traumaLevel: 'Level 1 Trauma Center',
    address: 'Veer Savarkar Marg, Mahim',
    city: 'Mumbai',
    state: 'Maharashtra',
    emergencyPhone: '+91 22 2444 7000',
    ambulancePhone: '+91 22 2445 2222',
    coordinates: { lat: 19.0330, lng: 72.8384 },
    open24_7: true,
    hasIcu: true,
    hasCathLab: true,
    hasPediatricEmergency: true,
    hasBloodBank: true,
    rating: 4.9,
    verifiedEmergencyDesk: true
  },
  {
    id: 'hosp-mum-3',
    name: 'KEM Hospital & Trauma Casualty Centre',
    type: 'Government Medical College',
    traumaLevel: 'Level 1 Trauma Center',
    address: 'Acharya Donde Marg, Parel',
    city: 'Mumbai',
    state: 'Maharashtra',
    emergencyPhone: '+91 22 2410 7000',
    ambulancePhone: '108',
    coordinates: { lat: 19.0028, lng: 72.8428 },
    open24_7: true,
    hasIcu: true,
    hasCathLab: true,
    hasPediatricEmergency: true,
    hasBloodBank: true,
    rating: 4.6,
    verifiedEmergencyDesk: true
  },
  {
    id: 'hosp-mum-4',
    name: 'Kokilaben Dhirubhai Ambani Hospital',
    type: 'Super Specialty',
    traumaLevel: 'Level 1 Trauma Center',
    address: 'Rao Saheb Achutrao Patwardhan Marg, Four Bungalows, Andheri West',
    city: 'Mumbai',
    state: 'Maharashtra',
    emergencyPhone: '+91 22 3099 9999',
    ambulancePhone: '+91 22 3091 9191',
    coordinates: { lat: 19.1314, lng: 72.8252 },
    open24_7: true,
    hasIcu: true,
    hasCathLab: true,
    hasPediatricEmergency: true,
    hasBloodBank: true,
    rating: 4.9,
    verifiedEmergencyDesk: true
  },
  {
    id: 'hosp-mum-5',
    name: 'Bhabha Municipal General Hospital',
    type: 'District Hospital',
    traumaLevel: 'Level 2 Trauma Center',
    address: 'Waterfield Road, Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    emergencyPhone: '+91 22 2642 2775',
    ambulancePhone: '108',
    coordinates: { lat: 19.0583, lng: 72.8347 },
    open24_7: true,
    hasIcu: true,
    hasCathLab: false,
    hasPediatricEmergency: true,
    hasBloodBank: true,
    rating: 4.2,
    verifiedEmergencyDesk: true
  },

  // Delhi-NCR / Central Reference
  {
    id: 'hosp-del-1',
    name: 'AIIMS Jai Prakash Narayan Apex Trauma Center',
    type: 'Government Medical College',
    traumaLevel: 'Level 1 Trauma Center',
    address: 'Ring Road, Raj Nagar, Safdarjung Enclave',
    city: 'New Delhi',
    state: 'Delhi',
    emergencyPhone: '+91 11 2673 1000',
    ambulancePhone: '108',
    coordinates: { lat: 28.5684, lng: 77.1996 },
    open24_7: true,
    hasIcu: true,
    hasCathLab: true,
    hasPediatricEmergency: true,
    hasBloodBank: true,
    rating: 4.9,
    verifiedEmergencyDesk: true
  }
];

export class HospitalLocatorService {
  /**
   * Calculates Haversine distance between two coordinates in kilometers.
   */
  public calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  /**
   * Estimates vehicle / ambulance transit time in urban traffic.
   */
  public estimateTransitMinutes(distanceKm: number): number {
    if (distanceKm <= 0.5) return 2;
    // Base 2 minutes dispatch plus ~2.5 min per km with sirens/traffic
    return Math.max(3, Math.round(distanceKm * 2.5 + 2));
  }

  /**
   * Queries nearby hospitals sorted by proximity from the user's coordinates.
   */
  public getNearbyHospitals(
    userLat?: number,
    userLng?: number,
    filterTag: 'all' | 'trauma' | 'cardiac' | 'pediatric' = 'all'
  ): EmergencyHospital[] {
    // Default fallback to West Bengal / Mumbai coordinate hub if not provided
    const baseLat = typeof userLat === 'number' && !isNaN(userLat) ? userLat : 22.9287;
    const baseLng = typeof userLng === 'number' && !isNaN(userLng) ? userLng : 88.3772;

    const list: EmergencyHospital[] = HOSPITAL_DIRECTORY.map((hosp) => {
      const distanceKm = this.calculateDistanceKm(
        baseLat,
        baseLng,
        hosp.coordinates.lat,
        hosp.coordinates.lng
      );
      const estimatedTransitMinutes = this.estimateTransitMinutes(distanceKm);

      return {
        ...hosp,
        emergencyPhone: formatIndianPhoneNumber(hosp.emergencyPhone),
        distanceKm,
        estimatedTransitMinutes
      };
    });

    // Apply filtering
    let filtered = list;
    if (filterTag === 'trauma') {
      filtered = filtered.filter((h) => h.traumaLevel.includes('Level 1') || h.traumaLevel.includes('Level 2'));
    } else if (filterTag === 'cardiac') {
      filtered = filtered.filter((h) => h.hasCathLab);
    } else if (filterTag === 'pediatric') {
      filtered = filtered.filter((h) => h.hasPediatricEmergency);
    }

    // Sort by proximity (nearest first)
    filtered.sort((a, b) => a.distanceKm - b.distanceKm);

    return filtered;
  }

  /**
   * Generates a turn-by-turn Google Maps navigation URL from patient coordinates to hospital.
   */
  public getDirectionsUrl(hospital: EmergencyHospital, userLat?: number, userLng?: number): string {
    const destinationQuery = encodeURIComponent(`${hospital.name}, ${hospital.address}, ${hospital.city}`);
    if (typeof userLat === 'number' && typeof userLng === 'number') {
      return `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${destinationQuery}&travelmode=driving`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${destinationQuery}&travelmode=driving`;
  }

  /**
   * Generates a Google Maps URL searching all live emergency hospitals around patient's coordinates.
   */
  public getGoogleMapsSearchUrl(userLat?: number, userLng?: number): string {
    if (typeof userLat === 'number' && typeof userLng === 'number') {
      return `https://www.google.com/maps/search/emergency+hospital+trauma+center/@${userLat},${userLng},14z`;
    }
    return `https://www.google.com/maps/search/emergency+hospital+trauma+center+near+me`;
  }

  /**
   * Formats telephone for direct calling.
   */
  public getDialablePhone(phone: string): string {
    return toDialablePhone(phone);
  }
}

export const hospitalLocatorService = new HospitalLocatorService();
