import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { City } from '../types/shift';
import { colors } from '../theme/colors';

const CITIES: City[] = ['Helsinki', 'Tampere', 'Turku'];

interface CityTabsProps {
  selectedCity: City;
  counts: Record<City, number>;
  onSelectCity: (city: City) => void;
}

export const CityTabs: React.FC<CityTabsProps> = ({
  selectedCity,
  counts,
  onSelectCity,
}) => {
  return (
    <View style={styles.container}>
      {CITIES.map((city) => {
        const isSelected = city === selectedCity;
        const count = counts[city] ?? 0;
        const label = `${city} (${count})`;

        return (
          <TouchableOpacity
            key={city}
            style={[styles.tab, isSelected && styles.tabSelected]}
            onPress={() => onSelectCity(city)}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${city}, ${count} shifts`}
          >
            <Text style={[styles.tabText, isSelected && styles.tabTextSelected]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingHorizontal: 12,
  },
  tab: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginRight: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabSelected: {
    borderBottomColor: colors.activeBlue,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.inactiveGrey,
  },
  tabTextSelected: {
    color: colors.activeBlue,
    fontWeight: '700',
  },
});

export default React.memo(CityTabs);
