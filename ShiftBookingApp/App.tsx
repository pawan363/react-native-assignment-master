import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { ShiftProvider } from './src/store/ShiftContext';
import MyShiftsScreen from './src/screens/MyShiftsScreen';
import AvailableShiftsScreen from './src/screens/AvailableShiftsScreen';

const Tab = createBottomTabNavigator();

/**
 * Simple icon component for the tab bar using emoji/text.
 */
function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{label}</Text>
  );
}

export default function App() {
  return (
    <ShiftProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#4CAF50',
            tabBarInactiveTintColor: '#999999',
            tabBarStyle: styles.tabBar,
            tabBarLabelStyle: styles.tabLabel,
            headerStyle: styles.header,
            headerTitleStyle: styles.headerTitle,
            headerTitleAlign: 'center',
          }}
        >
          <Tab.Screen
            name="MyShifts"
            component={MyShiftsScreen}
            options={{
              title: 'My Shifts',
              tabBarIcon: ({ focused }) => (
                <TabIcon label="📅" focused={focused} />
              ),
            }}
          />
          <Tab.Screen
            name="AvailableShifts"
            component={AvailableShiftsScreen}
            options={{
              title: 'Available Shifts',
              tabBarIcon: ({ focused }) => (
                <TabIcon label="🔍" focused={focused} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </ShiftProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E0E0E0',
    paddingBottom: 6,
    paddingTop: 6,
    height: 60,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#4CAF50',
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
});
