import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Area } from '../types/shift';

const AREAS: Area[] = ['Helsinki', 'Tampere', 'Turku'];

interface AreaFilterProps {
  selectedArea: Area;
  onSelectArea: (area: Area) => void;
}

/**
 * Horizontal row of pill-shaped filter buttons for selecting a city / area.
 * The active area is filled green; the others are outlined.
 */
const AreaFilter: React.FC<AreaFilterProps> = ({ selectedArea, onSelectArea }) => (
  <View style={styles.wrapper}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {AREAS.map((area) => {
        const isSelected = area === selectedArea;
        return (
          <TouchableOpacity
            key={area}
            style={[styles.pill, isSelected && styles.pillSelected]}
            onPress={() => onSelectArea(area)}
            activeOpacity={0.7}
          >
            <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
              {area}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#4CAF50',
    backgroundColor: '#FFFFFF',
    marginRight: 10,
  },
  pillSelected: {
    backgroundColor: '#4CAF50',
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  pillTextSelected: {
    color: '#FFFFFF',
  },
});

export default React.memo(AreaFilter);
