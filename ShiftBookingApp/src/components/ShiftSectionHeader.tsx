import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ShiftSectionHeaderProps {
  title: string;
  count: number;
}

/**
 * Section header rendered above each date group in the shift SectionList.
 * Displays the date label (e.g. "Today, November 4") and the shift count.
 */
const ShiftSectionHeader: React.FC<ShiftSectionHeaderProps> = ({ title, count }) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.count}>
      {count} {count === 1 ? 'shift' : 'shifts'}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#F0F0F0',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#DDDDDD',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333333',
  },
  count: {
    fontSize: 13,
    fontWeight: '500',
    color: '#888888',
  },
});

export default React.memo(ShiftSectionHeader);
