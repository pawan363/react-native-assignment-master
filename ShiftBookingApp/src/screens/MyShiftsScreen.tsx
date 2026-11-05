import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useShiftContext } from '../store/ShiftContext';
import { groupShiftsByDate } from '../utils/dateUtils';
import ShiftCard from '../components/ShiftCard';
import ShiftSectionHeader from '../components/ShiftSectionHeader';
import EmptyState from '../components/EmptyState';
import { Shift, ShiftSection } from '../types/shift';

/**
 * "My Shifts" screen — lists all booked shifts, grouped by date.
 * Shifts can be cancelled from this view.
 */
export default function MyShiftsScreen() {
  const { shifts, loading, error, loadingShiftIds, cancelShift, fetchShifts } =
    useShiftContext();

  // Filter only booked shifts
  const bookedShifts = shifts.filter((s) => s.booked);
  const sections: ShiftSection[] = groupShiftsByDate(bookedShifts);

  const handleBook = useCallback(() => {
    // No-op: cannot book from My Shifts screen
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Shift }) => (
      <ShiftCard
        shift={item}
        onBook={handleBook}
        onCancel={cancelShift}
        isLoading={loadingShiftIds.includes(item.id)}
      />
    ),
    [cancelShift, loadingShiftIds, handleBook],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: ShiftSection }) => (
      <ShiftSectionHeader title={section.title} count={section.data.length} />
    ),
    [],
  );

  const renderEmpty = useCallback(
    () =>
      loading ? null : (
        <EmptyState message="No booked shifts yet. Head over to Available Shifts to book some!" />
      ),
    [loading],
  );

  const keyExtractor = useCallback((item: Shift) => item.id, []);

  if (loading && shifts.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading shifts…</Text>
      </View>
    );
  }

  if (error && shifts.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader as any}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={
          sections.length === 0 ? styles.emptyContainer : styles.list
        }
        stickySectionHeadersEnabled
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchShifts}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  list: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#888888',
  },
  errorText: {
    fontSize: 15,
    color: '#F44336',
    textAlign: 'center',
  },
});
