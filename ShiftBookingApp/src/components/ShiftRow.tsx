import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ShiftWithStatus } from '../types/shift';
import { formatTime } from '../utils/dateUtils';
import { colors } from '../theme/colors';
import Spinner from './Spinner';

interface ShiftRowProps {
  shift: ShiftWithStatus;
  onBook?: (id: string) => void;
  onCancel?: (id: string) => void;
  showArea?: boolean;
}

export const ShiftRow: React.FC<ShiftRowProps> = ({
  shift,
  onBook,
  onCancel,
  showArea = true,
}) => {
  const timeRange = `${formatTime(shift.startTime)}-${formatTime(shift.endTime)}`;
  const areaName = shift.area;
  const isPending = shift.pendingStatus && shift.pendingStatus !== 'idle';

  // Determine action and labels based on PRD FR-4, FR-5, FR-10
  const isBooked = shift.booked;
  const isStarted = shift.isStarted;
  const isOverlapping = shift.isOverlapping;

  const renderAction = () => {
    // 1. In-flight spinner
    if (isPending) {
      const spinnerColor = shift.pendingStatus === 'booking' ? 'green' : 'red';
      return (
        <View style={styles.actionBox}>
          <Spinner color={spinnerColor} size={28} />
        </View>
      );
    }

    // 2. Booked by the user
    if (isBooked) {
      const isDisabled = isStarted;
      return (
        <View style={styles.actionRow}>
          <Text style={styles.statusLabelBooked}>Booked</Text>
          <TouchableOpacity
            style={[
              styles.button,
              styles.cancelButton,
              isDisabled && styles.cancelButtonDisabled,
            ]}
            onPress={() => !isDisabled && onCancel && onCancel(shift.id)}
            disabled={isDisabled}
            activeOpacity={0.7}
            accessibilityLabel={`Cancel shift ${timeRange} in ${areaName}`}
            accessibilityRole="button"
            accessibilityState={{ disabled: isDisabled }}
          >
            <Text
              style={[
                styles.cancelButtonText,
                isDisabled && styles.cancelButtonTextDisabled,
              ]}
            >
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    // 3. Overlapping a booked shift
    if (isOverlapping) {
      return (
        <View style={styles.actionRow}>
          <Text style={styles.statusLabelOverlapping}>Overlapping</Text>
          <TouchableOpacity
            style={[styles.button, styles.bookButtonDisabled]}
            disabled={true}
            accessibilityLabel={`Overlapping shift ${timeRange} in ${areaName}`}
            accessibilityRole="button"
            accessibilityState={{ disabled: true }}
          >
            <Text style={styles.bookButtonTextDisabled}>Book</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // 4. Started (and not booked)
    if (isStarted) {
      return (
        <View style={styles.actionBox}>
          <TouchableOpacity
            style={[styles.button, styles.bookButtonDisabled]}
            disabled={true}
            accessibilityLabel={`Started shift ${timeRange} in ${areaName}`}
            accessibilityRole="button"
            accessibilityState={{ disabled: true }}
          >
            <Text style={styles.bookButtonTextDisabled}>Book</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // 5. Open shift (Not booked, not started, not overlapping)
    return (
      <View style={styles.actionBox}>
        <TouchableOpacity
          style={[styles.button, styles.bookButton]}
          onPress={() => onBook && onBook(shift.id)}
          activeOpacity={0.7}
          accessibilityLabel={`Book shift ${timeRange} in ${areaName}`}
          accessibilityRole="button"
        >
          <Text style={styles.bookButtonText}>Book</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.infoCol}>
        <Text style={styles.timeRangeText}>{timeRange}</Text>
        {showArea && <Text style={styles.areaText}>{areaName}</Text>}
      </View>
      <View style={styles.actionCol}>{renderAction()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    minHeight: 68,
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  timeRangeText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textDark,
  },
  areaText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  actionCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBox: {
    minWidth: 92,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusLabelBooked: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textDark,
    marginRight: 16,
  },
  statusLabelOverlapping: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.redPrimary,
    marginRight: 16,
  },
  button: {
    minWidth: 92,
    height: 38,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderWidth: 1.5,
  },
  bookButton: {
    backgroundColor: colors.cardBackground,
    borderColor: colors.greenBorder,
  },
  bookButtonDisabled: {
    backgroundColor: colors.cardBackground,
    borderColor: colors.greenDisabledBorder,
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.greenPrimary,
  },
  bookButtonTextDisabled: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.greenDisabledText,
  },
  cancelButton: {
    backgroundColor: colors.cardBackground,
    borderColor: colors.redBorder,
  },
  cancelButtonDisabled: {
    backgroundColor: colors.cardBackground,
    borderColor: colors.redDisabledBorder,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.redPrimary,
  },
  cancelButtonTextDisabled: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.redDisabledText,
  },
});

export default React.memo(ShiftRow);
