import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { ShiftProvider } from './src/store/ShiftContext';
import MyShiftsScreen from './src/screens/MyShiftsScreen';
import AvailableShiftsScreen from './src/screens/AvailableShiftsScreen';
import { colors } from './src/theme/colors';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <ShiftProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Tab.Navigator
            initialRouteName="MyShifts"
            screenOptions={{
              tabBarActiveTintColor: colors.primary,
              tabBarInactiveTintColor: colors.textSecondary,
              tabBarStyle: styles.tabBar,
              tabBarLabelStyle: styles.tabLabel,
              tabBarIcon: () => null, // Design spec shows text-only tabs or simple links
              headerStyle: styles.header,
              headerTitleStyle: styles.headerTitle,
              headerTitleAlign: 'left',
            }}
          >
            <Tab.Screen
              name="MyShifts"
              component={MyShiftsScreen}
              options={{
                title: 'My shifts',
              }}
            />
            <Tab.Screen
              name="AvailableShifts"
              component={AvailableShiftsScreen}
              options={{
                title: 'Available shifts',
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </ShiftProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.cardBackground,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    height: 56,
    paddingBottom: 4,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 14,
  },
  header: {
    backgroundColor: colors.cardBackground,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTitle: {
    color: colors.textDark,
    fontWeight: '700',
    fontSize: 18,
    marginLeft: 8,
  },
});
