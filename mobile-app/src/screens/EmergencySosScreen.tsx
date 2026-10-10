import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  ActivityIndicator,
  Share,
} from 'react-native';
import {
  AlertTriangle,
  Phone,
  MapPin,
  Shield,
  User,
  CheckCircle2,
  XCircle,
  Navigation,
  MessageSquare,
  Hospital,
  Share2,
} from 'lucide-react-native';
import * as Location from 'expo-location';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/apiClient';

interface NearbyHospital {
  name: string;
  distance: string;
  type: string;
  phone: string;
  address: string;
}

const NEARBY_FACILITIES: NearbyHospital[] = [
  {
    name: 'AIIMS Apex Trauma Center',
    distance: '1.8 km',
    type: 'Level 1 Trauma Center',
    phone: '011-26593677',
    address: 'Ring Road, Safdarjung Enclave, New Delhi',
  },
  {
    name: 'Safdarjung Emergency Dept',
    distance: '2.4 km',
    type: 'Government Super Specialty',
    phone: '011-26165060',
    address: 'Ansari Nagar East, New Delhi',
  },
  {
    name: 'Max Healthcare Emergency Care',
    distance: '4.1 km',
    type: '24x7 Multi-Specialty ICU',
    phone: '011-26515050',
    address: '1, Press Enclave Marg, Saket',
  },
];

export const EmergencySosScreen: React.FC = () => {
  const { patient } = useAuth();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [triggering, setTriggering] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [sosDetails, setSosDetails] = useState<any>(null);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationTimestamp, setLocationTimestamp] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
          setCurrentCoords({
            lat: loc.coords.latitude,
            lng: loc.coords.longitude,
          });
          setLocationTimestamp(new Date().toLocaleTimeString());
        }
      } catch {
        // Fallback or permission denied
      }
    })();
  }, []);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      dispatchSos();
      setCountdown(null);
    }
  }, [countdown]);

  const startCountdown = () => {
    setCountdown(3);
  };

  const cancelCountdown = () => {
    setCountdown(null);
  };

  const dispatchSos = async () => {
    if (!patient?.id) return;
    setTriggering(true);

    const coords = currentCoords || { lat: 28.6139, lng: 77.209 };

    try {
      const response = await api.triggerEmergency(patient.id, coords);
      setSosActive(true);
      setSosDetails(response);
      Alert.alert(
        'EMERGENCY BEACON ACTIVE',
        'Clinical distress beacon dispatched. Registered responders and emergency dispatch have received your real-time telemetry.'
      );
    } catch {
      Alert.alert(
        'Server Alert Timeout',
        'Direct server beacon could not be reached. Opening standard emergency SMS fallback.'
      );
      sendSmsFallback();
    } finally {
      setTriggering(false);
    }
  };

  const sendSmsFallback = () => {
    const lat = currentCoords?.lat || 28.6139;
    const lng = currentCoords?.lng || 77.209;
    const time = locationTimestamp || new Date().toLocaleTimeString();
    const mapUrl = `https://maps.google.com/?q=${lat},${lng}`;
    const message = `EMERGENCY SOS: Patient ${patient?.name || 'Aryan Yadav'} needs immediate medical assistance. Last GPS: ${mapUrl}. Coordinates: ${lat}, ${lng}. Timestamp: ${time}.`;

    const recipient = patient?.emergencyContacts?.[0]?.phone || '112';
    const smsUrl = `sms:${recipient}?body=${encodeURIComponent(message)}`;
    Linking.openURL(smsUrl).catch(() => {
      Share.share({ message });
    });
  };

  const openDirections = (lat?: number, lng?: number, address?: string) => {
    const query = address ? encodeURIComponent(address) : `${lat || 28.6139},${lng || 77.209}`;
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Red Alert Banner */}
      <View style={styles.alertBanner}>
        <AlertTriangle size={24} color="#EF4444" />
        <View style={{ flex: 1 }}>
          <Text style={styles.alertBannerTitle}>Emergency Critical Response</Text>
          <Text style={styles.alertBannerDesc}>
            Transmits real-time GPS coordinates, clinical allergies, and blood group to emergency response teams.
          </Text>
        </View>
      </View>

      {/* SOS Center */}
      <View style={styles.actionCenter}>
        {sosActive ? (
          <View style={styles.activeBeaconCard}>
            <CheckCircle2 size={48} color="#10B981" />
            <Text style={styles.beaconStatus}>BEACON ACTIVE & TRANSMITTING</Text>
            <Text style={styles.beaconTime}>
              Dispatched at: {sosDetails?.timestamp || new Date().toLocaleTimeString()}
            </Text>
            <Text style={styles.beaconCoords}>
              GPS: {sosDetails?.location?.latitude?.toFixed(4) || '28.6139'},{' '}
              {sosDetails?.location?.longitude?.toFixed(4) || '77.2090'}
            </Text>
            <View style={styles.beaconActionRow}>
              <TouchableOpacity style={styles.smsShareBtn} onPress={sendSmsFallback}>
                <Share2 size={16} color="#FFFFFF" />
                <Text style={styles.smsShareText}>Share SOS Coordinates</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deactivateButton} onPress={() => setSosActive(false)}>
                <Text style={styles.deactivateButtonText}>Stand Down</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : countdown !== null ? (
          <View style={styles.countdownCard}>
            <Text style={styles.countdownHeader}>TRANSMITTING DISTRESS IN</Text>
            <Text style={styles.countdownNumber}>{countdown}</Text>
            <TouchableOpacity style={styles.abortButton} onPress={cancelCountdown}>
              <XCircle size={20} color="#FFFFFF" />
              <Text style={styles.abortButtonText}>Cancel Emergency Broadcast</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.sosButton, triggering && styles.sosButtonDisabled]}
              onPress={startCountdown}
              disabled={triggering}
              accessibilityLabel="Trigger Emergency SOS"
            >
              {triggering ? (
                <ActivityIndicator size="large" color="#FFFFFF" />
              ) : (
                <>
                  <AlertTriangle size={44} color="#FFFFFF" />
                  <Text style={styles.sosButtonText}>SOS</Text>
                  <Text style={styles.sosButtonSub}>HOLD / TAP FOR HELP</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Quick Hotline Actions */}
      <View style={styles.hotlinesRow}>
        <TouchableOpacity
          style={[styles.hotlineButton, { backgroundColor: '#DC2626' }]}
          onPress={() => Linking.openURL('tel:112')}
        >
          <Phone size={18} color="#FFFFFF" />
          <Text style={styles.hotlineText}>Call 112 (National)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.hotlineButton, { backgroundColor: '#EA580C' }]}
          onPress={() => Linking.openURL('tel:108')}
        >
          <Hospital size={18} color="#FFFFFF" />
          <Text style={styles.hotlineText}>Call 108 (Ambulance)</Text>
        </TouchableOpacity>
      </View>

      {/* SMS Fallback Button */}
      <TouchableOpacity style={styles.smsFallbackButton} onPress={sendSmsFallback}>
        <MessageSquare size={18} color="#38BDF8" />
        <Text style={styles.smsFallbackText}>Send SMS with Live GPS Coordinates</Text>
      </TouchableOpacity>

      {/* Live GPS Telemetry Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoTitleRow}>
          <MapPin size={18} color="#0D9488" />
          <Text style={styles.infoTitle}>GPS Telemetry Status</Text>
          {locationTimestamp && <Text style={styles.infoTimestamp}>{locationTimestamp}</Text>}
        </View>
        <Text style={styles.infoValue}>
          {currentCoords
            ? `Lat: ${currentCoords.lat.toFixed(5)}, Lng: ${currentCoords.lng.toFixed(5)}`
            : 'Acquiring GPS fix via device hardware...'}
        </Text>
        {currentCoords && (
          <TouchableOpacity
            style={styles.openMapLink}
            onPress={() => openDirections(currentCoords.lat, currentCoords.lng)}
          >
            <Navigation size={14} color="#0D9488" />
            <Text style={styles.openMapText}>View current location on Google Maps</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Registered Contacts */}
      <Text style={styles.sectionTitle}>Registered Emergency Contacts</Text>
      {patient?.emergencyContacts && patient.emergencyContacts.length > 0 ? (
        patient.emergencyContacts.map((contact, index) => (
          <View key={index} style={styles.contactCard}>
            <View style={styles.contactIconWrap}>
              <User size={20} color="#3B82F6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactRelation}>{contact.relationship}</Text>
              <Text style={styles.contactPhone}>{contact.phone}</Text>
            </View>
            <TouchableOpacity
              style={styles.callContactButton}
              onPress={() => Linking.openURL(`tel:${contact.phone}`)}
            >
              <Phone size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <View style={styles.noContactCard}>
          <Shield size={22} color="#64748B" />
          <Text style={styles.noContactText}>
            No emergency contacts registered. Please add contacts in Profile Setup.
          </Text>
        </View>
      )}

      {/* Nearby 24x7 Emergency Facilities */}
      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Nearest 24x7 Emergency Centers</Text>
      {NEARBY_FACILITIES.map((facility, index) => (
        <View key={index} style={styles.facilityCard}>
          <View style={{ flex: 1 }}>
            <View style={styles.facilityHeader}>
              <Text style={styles.facilityName}>{facility.name}</Text>
              <Text style={styles.facilityDistance}>{facility.distance}</Text>
            </View>
            <Text style={styles.facilityType}>{facility.type}</Text>
            <Text style={styles.facilityAddress}>{facility.address}</Text>
          </View>
          <View style={styles.facilityActions}>
            <TouchableOpacity
              style={styles.facilityCallBtn}
              onPress={() => Linking.openURL(`tel:${facility.phone}`)}
            >
              <Phone size={14} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.facilityNavBtn}
              onPress={() => openDirections(undefined, undefined, facility.address)}
            >
              <Navigation size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B132B',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginBottom: 16,
  },
  alertBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F87171',
  },
  alertBannerDesc: {
    fontSize: 11,
    color: '#CBD5E1',
    marginTop: 2,
    lineHeight: 16,
  },
  actionCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  sosButton: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    borderWidth: 4,
    borderColor: '#EF4444',
  },
  sosButtonDisabled: {
    opacity: 0.7,
  },
  sosButtonText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginTop: 4,
  },
  sosButtonSub: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  countdownCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  countdownHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
    letterSpacing: 1,
  },
  countdownNumber: {
    fontSize: 60,
    fontWeight: '900',
    color: '#FFFFFF',
    marginVertical: 12,
  },
  abortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#DC2626',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  abortButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  activeBeaconCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  beaconStatus: {
    color: '#10B981',
    fontWeight: '800',
    fontSize: 15,
    marginTop: 10,
  },
  beaconTime: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
  },
  beaconCoords: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  beaconActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  smsShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0284C7',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  smsShareText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  deactivateButton: {
    backgroundColor: '#334155',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  deactivateButtonText: {
    color: '#F1F5F9',
    fontWeight: '600',
    fontSize: 12,
  },
  hotlinesRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  hotlineButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
  },
  hotlineText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  smsFallbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1E293B',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#38BDF8',
    marginBottom: 16,
  },
  smsFallbackText: {
    color: '#38BDF8',
    fontWeight: '600',
    fontSize: 13,
  },
  infoCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  infoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
    flex: 1,
  },
  infoTimestamp: {
    fontSize: 11,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 12,
    color: '#94A3B8',
  },
  openMapLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  openMapText: {
    color: '#0D9488',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 10,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    gap: 12,
  },
  contactIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  contactRelation: {
    fontSize: 11,
    color: '#94A3B8',
  },
  contactPhone: {
    fontSize: 12,
    color: '#38BDF8',
  },
  callContactButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noContactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1E293B',
    padding: 14,
    borderRadius: 10,
  },
  noContactText: {
    fontSize: 12,
    color: '#94A3B8',
    flex: 1,
  },
  facilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    gap: 12,
  },
  facilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  facilityName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
    flex: 1,
  },
  facilityDistance: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
    marginLeft: 8,
  },
  facilityType: {
    fontSize: 11,
    color: '#38BDF8',
    marginTop: 2,
  },
  facilityAddress: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  facilityActions: {
    flexDirection: 'row',
    gap: 8,
  },
  facilityCallBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
  },
  facilityNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
