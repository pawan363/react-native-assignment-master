import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { colors } from '../theme/colors';

interface SpinnerProps {
  color?: 'green' | 'red';
  size?: number;
}

export const Spinner: React.FC<SpinnerProps> = ({ color = 'green', size = 24 }) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const strokeColor = color === 'green' ? colors.greenPrimary : colors.redPrimary;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== 'web',
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <Svg width={size} height={size} viewBox="0 0 38 38" stroke={strokeColor}>
          <G fill="none" fillRule="evenodd">
            <G transform="translate(1 1)" strokeWidth="3">
              <Circle strokeOpacity="0.3" cx="18" cy="18" r="18" />
              <Path d="M36 18c0-9.94-8.06-18-18-18" />
            </G>
          </G>
        </Svg>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default React.memo(Spinner);
