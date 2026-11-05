import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Shift } from '../types/shift';
import { formatTime } from '../utils/dateUtils';

interface ShiftCardProps {
  shift: Shift;
  onBook: (id: string) => void;
  onCancel: (id: string) => void;
  isLoading: boolean;
}

/**
 * Displays a single shift with its time range, area, and a Book / Cancel button.
 * If the shift has already started the button is replaced by a "Started" label.
 */
const ShiftCard: React.FC<ShiftCardProps> = ({
  shift,
  onBook,
  onCancel,
  isLoading,
}) => {
  const started = Date.now() >= shift.startTime;
  const timeRange = `${formatTime(shift.startTime)} - ${formatTime(shift.endTime)}`;

  const handlePress = () => {
    if (shift.booked) {
      onCancel(shift.id);
    } else {
      onBook(shift.id);
    }
  };

  return (
    <View style={styles.card}>
      {/* Left side — time & area */}
      <View style={styles.info}>
        <Text style={styles.time}>{timeRange}</Text>
        <Text style={styles.area}>{shift.area}</Text>
      </View>

      {/* Right side — action button or status label */}
      <View style={styles.actionContainer}>
        {started ? (
          <View style={styles.startedBadge}>
            <Text style={styles.startedText}>Started</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.button,
              shift.booked ? styles.cancelButton : styles.bookButton,
              isLoading && styles.buttonDisabled,
            ]}
            onPress={handlePress}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            {isLoading ? (
              <ActivityIndicator
                size="small"
                color={shift.booked ? '#F44336' : '#4CAF50'}
              />
            ) : (
              <Text
                style={[
                  styles.buttonText,
                  shift.booked ? styles.cancelButtonText : styles.bookButtonText,
                ]}
              >
                {shift.booked ? 'Cancel' : 'Book'}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 10,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    // Elevation for Android
    elevation: 3,
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  time: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  area: {
    fontSize: 13,
    color: '#888888',
    marginTop: 4,
  },
  actionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    minWidth: 90,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  bookButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#F44336',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bookButtonText: {
    color: '#4CAF50',
  },
  cancelButtonText: {
    color: '#F44336',
  },
  startedBadge: {
    minWidth: 90,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#EEEEEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startedText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999999',
  },
});

export default React.memo(ShiftCard);
