import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useShiftContext } from '../store/ShiftContext';
import { ShiftWithStatus, ShiftSection } from '../types/shift';
import ShiftRow from '../components/ShiftRow';
import DateHeader from '../components/DateHeader';
import EmptyState from '../components/EmptyState';
import { colors } from '../theme/colors';

export default function MyShiftsScreen() {
  const {
    bookedSections,
    status,
    error,
    cancelShift,
    fetchShifts,
    lastActionError,
    clearActionError,
  } = useShiftContext();

  const isInitialLoading = status === 'loading' && bookedSections.length === 0;
  const isRefreshing = status === 'loading' && bookedSections.length > 0;

  const renderItem = useCallback(
    ({ item }: { item: ShiftWithStatus }) => (
      <ShiftRow shift={item} onCancel={cancelShift} showArea={true} />
    ),
    [cancelShift],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: ShiftSection }) => (
      <DateHeader
        title={section.title}
        count={section.shiftCount}
        totalHours={section.totalHours}
      />
    ),
    [],
  );

  const renderEmpty = useCallback(() => {
    if (status === 'loading') {
      return null;
    }
    return <EmptyState message="You haven't booked any shifts yet." />;
  }, [status]);

  if (isInitialLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (status === 'failed' && bookedSections.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Failed to load shifts'}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchShifts}
          activeOpacity={0.7}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {lastActionError && (
        <TouchableOpacity
          style={styles.actionErrorBanner}
          onPress={clearActionError}
          activeOpacity={0.8}
        >
          <Text style={styles.actionErrorText}>{lastActionError} (tap to dismiss)</Text>
        </TouchableOpacity>
      )}

      <SectionList
        sections={bookedSections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={
          bookedSections.length === 0 ? styles.emptyListContent : styles.listContent
        }
        stickySectionHeadersEnabled={false}
        initialNumToRender={12}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews={Platform.OS !== 'web'}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={fetchShifts}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 15,
    color: colors.redPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: colors.primary,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  actionErrorBanner: {
    backgroundColor: '#FFE5EC',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.redBorder,
  },
  actionErrorText: {
    color: colors.redPrimary,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
});
