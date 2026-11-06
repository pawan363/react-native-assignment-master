import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { formatHeaderStats } from '../utils/dateUtils';

interface DateHeaderProps {
  title: string;
  count: number;
  totalHours: number;
}

export const DateHeader: React.FC<DateHeaderProps> = ({ title, count, totalHours }) => {
  const stats = formatHeaderStats(count, totalHours);

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>{title}</Text>
      <Text style={styles.statsText}>{stats}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  titleText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textDark,
    marginRight: 12,
  },
  statsText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '400',
  },
});

export default React.memo(DateHeader);
