import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  LayoutDashboard,
  Activity,
  Pill,
  Bot,
  AlertTriangle,
  Calendar,
  Stethoscope,
  ShieldCheck
} from 'lucide-react-native';

import { useAuth } from '../context/AuthContext';
import { DashboardOverviewScreen } from '../screens/DashboardOverviewScreen';
import { DoctorDashboardScreen } from '../screens/DoctorDashboardScreen';
import { AppointmentsScreen } from '../screens/AppointmentsScreen';
import { DoctorHandoffScreen } from '../screens/DoctorHandoffScreen';
import { VitalsScreen } from '../screens/VitalsScreen';
import { MedicationsScreen } from '../screens/MedicationsScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { EmergencySosScreen } from '../screens/EmergencySosScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

export type MainTabParamList = {
  Overview: undefined;
  Appointments: undefined;
  Vitals: undefined;
  Medications: undefined;
  AIChat: undefined;
  Emergency: undefined;
  DoctorHandoff: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
  const { role } = useAuth();
  const isDoctor = role === 'doctor';

  return (
    <Tab.Navigator
      id="MainTabs"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0F172A',
          borderTopColor: '#1E293B',
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: isDoctor ? '#3B82F6' : '#0D9488',
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}
    >
      {isDoctor ? (
        // ==========================================
        // DOCTOR / CLINICIAN PORTAL TABS
        // ==========================================
        <>
          <Tab.Screen
            name="Overview"
            component={DoctorDashboardScreen}
            options={{
              tabBarLabel: 'Practice Hub',
              tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
            }}
          />
          <Tab.Screen
            name="Appointments"
            component={AppointmentsScreen}
            options={{
              tabBarLabel: 'Queue & Visits',
              tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
            }}
          />
          <Tab.Screen
            name="DoctorHandoff"
            component={DoctorHandoffScreen}
            options={{
              tabBarLabel: 'Handoffs',
              tabBarIcon: ({ color, size }) => <Stethoscope size={size} color={color} />,
            }}
          />
          <Tab.Screen
            name="AIChat"
            component={ChatScreen}
            options={{
              tabBarLabel: 'AI Copilot',
              tabBarIcon: ({ color, size }) => <Bot size={size} color={color} />,
            }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              tabBarLabel: 'Governance',
              tabBarIcon: ({ color, size }) => <ShieldCheck size={size} color={color} />,
            }}
          />
        </>
      ) : (
        // ==========================================
        // PATIENT HEALTH PORTAL TABS
        // ==========================================
        <>
          <Tab.Screen
            name="Overview"
            component={DashboardOverviewScreen}
            options={{
              tabBarLabel: 'Dashboard',
              tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
            }}
          />
          <Tab.Screen
            name="Appointments"
            component={AppointmentsScreen}
            options={{
              tabBarLabel: 'Care Visits',
              tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
            }}
          />
          <Tab.Screen
            name="AIChat"
            component={ChatScreen}
            options={{
              tabBarLabel: 'AI Triage',
              tabBarIcon: ({ color, size }) => <Bot size={size} color={color} />,
            }}
          />
          <Tab.Screen
            name="Vitals"
            component={VitalsScreen}
            options={{
              tabBarLabel: 'Vitals',
              tabBarIcon: ({ color, size }) => <Activity size={size} color={color} />,
            }}
          />
          <Tab.Screen
            name="Emergency"
            component={EmergencySosScreen}
            options={{
              tabBarLabel: 'SOS',
              tabBarActiveTintColor: '#EF4444',
              tabBarIcon: ({ color, size }) => <AlertTriangle size={size} color={color} />,
            }}
          />
        </>
      )}
    </Tab.Navigator>
  );
};
