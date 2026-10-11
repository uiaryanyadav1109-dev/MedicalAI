import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import { MainTabNavigator } from './MainTabNavigator';
import { AuthScreen } from '../screens/AuthScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { AppointmentsScreen } from '../screens/AppointmentsScreen';
import { DoctorDashboardScreen } from '../screens/DoctorDashboardScreen';
import { PatientCardScreen } from '../screens/PatientCardScreen';
import { ReportsScreen } from '../screens/ReportsScreen';
import { VitalsScreen } from '../screens/VitalsScreen';
import { MedicationsScreen } from '../screens/MedicationsScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { DoctorHandoffScreen } from '../screens/DoctorHandoffScreen';
import { IdentityVerificationScreen } from '../screens/IdentityVerificationScreen';
import { EmergencySosScreen } from '../screens/EmergencySosScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { DataAccessRequestsScreen } from '../screens/DataAccessRequestsScreen';

export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  MainTabs: undefined;
  Appointments: undefined;
  DoctorDashboard: undefined;
  PatientCard: undefined;
  DataAccessRequests: undefined;
  Reports: undefined;
  Vitals: undefined;
  Medications: undefined;
  AIChat: undefined;
  DoctorHandoff: undefined;
  IdentityVerification: undefined;
  Emergency: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0D9488" />
      </View>
    );
  }

  const initialRouteName =
    user?.role === 'patient' && !user?.hasCompletedOnboarding && !user?.bloodGroup
      ? 'Onboarding'
      : 'MainTabs';

  return (
    <Stack.Navigator
      id="RootStack"
      initialRouteName={initialRouteName}
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0F172A',
        },
        headerTintColor: '#F8FAFC',
        headerTitleStyle: {
          fontWeight: '700',
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: '#0F172A',
        },
      }}
    >
      {!isAuthenticated ? (
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{ headerShown: false }}
        />
      ) : (
        <>
          <Stack.Screen
            name="MainTabs"
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Appointments"
            component={AppointmentsScreen}
            options={{ title: 'Clinical Care Visits & Directory' }}
          />
          <Stack.Screen
            name="DoctorDashboard"
            component={DoctorDashboardScreen}
            options={{ title: 'Clinician Practice Hub' }}
          />
          <Stack.Screen
            name="PatientCard"
            component={PatientCardScreen}
            options={{ title: 'Digital Health Pass' }}
          />
          <Stack.Screen
            name="DataAccessRequests"
            component={DataAccessRequestsScreen}
            options={{ title: 'Data Access Requests & Consent' }}
          />
          <Stack.Screen
            name="Reports"
            component={ReportsScreen}
            options={{ title: 'Medical Reports & Diagnostics' }}
          />
          <Stack.Screen
            name="Vitals"
            component={VitalsScreen}
            options={{ title: 'Ambulatory Vitals & Telemetry' }}
          />
          <Stack.Screen
            name="Medications"
            component={MedicationsScreen}
            options={{ title: 'Active Regimen & Dose Logs' }}
          />
          <Stack.Screen
            name="AIChat"
            component={ChatScreen}
            options={{ title: 'Clinical AI Triage Assistant' }}
          />
          <Stack.Screen
            name="DoctorHandoff"
            component={DoctorHandoffScreen}
            options={{ title: 'Clinician Handoff Briefing' }}
          />
          <Stack.Screen
            name="IdentityVerification"
            component={IdentityVerificationScreen}
            options={{ title: 'Institutional Identity Credentials' }}
          />
          <Stack.Screen
            name="Emergency"
            component={EmergencySosScreen}
            options={{ title: 'Emergency SOS Protocol' }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: 'Settings & Privacy Governance' }}
          />
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ title: 'Patient Profile Setup' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};
