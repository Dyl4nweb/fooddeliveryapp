// ============================================================
// AGTURONG — Animated Splash Screen Component
// Cartoon Motorcycle Delivery Mascot with Dynamic Road & Motion
// ============================================================

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AnimatedSplashScreenProps {
  onFinish?: () => void;
}

export function AnimatedSplashScreen({ onFinish }: AnimatedSplashScreenProps) {
  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  // Animation drivers (useState lazy initializers compliant with React 19)
  const [scooterEntrance] = useState(() => new Animated.Value(-SCREEN_WIDTH * 0.7));
  const [scooterBob] = useState(() => new Animated.Value(0));
  const [scooterTilt] = useState(() => new Animated.Value(-4));
  const [speedLinesX] = useState(() => new Animated.Value(0));
  const [textScale] = useState(() => new Animated.Value(0.8));
  const [textOpacity] = useState(() => new Animated.Value(0));
  const [badgeOpacity] = useState(() => new Animated.Value(0));
  const [progressWidth] = useState(() => new Animated.Value(0));
  const [screenFade] = useState(() => new Animated.Value(1));

  useEffect(() => {
    let isMounted = true;

    // 1. Scooter rides in from left with spring
    Animated.spring(scooterEntrance, {
      toValue: 0,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // 2. Straighten scooter tilt after riding in
    Animated.timing(scooterTilt, {
      toValue: 0,
      duration: 500,
      delay: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    // 3. Continuous scooter bobbing up & down (riding over road bumps)
    const bobAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scooterBob, {
          toValue: -8,
          duration: 350,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(scooterBob, {
          toValue: 2,
          duration: 350,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    bobAnimation.start();

    // 4. Continuous speed lines flowing backward
    const speedAnimation = Animated.loop(
      Animated.timing(speedLinesX, {
        toValue: 1,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    speedAnimation.start();

    // 5. Brand text reveal
    Animated.sequence([
      Animated.delay(250),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(textScale, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
      // 6. Badge reveal
      Animated.timing(badgeOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();

    // 7. Loading progress bar
    Animated.timing(progressWidth, {
      toValue: 1,
      duration: 1700,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: false,
    }).start();

    // 8. Exit / smooth transition to main app
    const finishTimer = setTimeout(() => {
      if (!isMounted) return;
      Animated.timing(screenFade, {
        toValue: 0,
        duration: 350,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        bobAnimation.stop();
        speedAnimation.stop();
        if (isMounted) {
          onFinishRef.current?.();
        }
      });
    }, 1800);

    // 9. Hard safety fallback timer (guarantees exit even if animation halts or frames drop)
    const hardSafetyTimer = setTimeout(() => {
      bobAnimation.stop();
      speedAnimation.stop();
      if (isMounted) {
        onFinishRef.current?.();
      }
    }, 2200);

    return () => {
      isMounted = false;
      clearTimeout(finishTimer);
      clearTimeout(hardSafetyTimer);
      bobAnimation.stop();
    };
  }, [
    scooterEntrance,
    scooterBob,
    scooterTilt,
    speedLinesX,
    textScale,
    textOpacity,
    badgeOpacity,
    progressWidth,
    screenFade,
  ]);

  const roadLineTranslate1 = speedLinesX.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -60],
  });

  const roadLineTranslate2 = speedLinesX.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -100],
  });

  const tiltInterpolate = scooterTilt.interpolate({
    inputRange: [-10, 0, 10],
    outputRange: ['-10deg', '0deg', '10deg'],
  });

  const progressInterpolate = progressWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: screenFade }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => onFinishRef.current?.()}
        style={styles.touchArea}
      >
        {/* Background Decorative Circles */}
        <View style={styles.backgroundCircleLarge} />
        <View style={styles.backgroundCircleSmall} />

        {/* Main Mascot & Scooter Scene */}
        <View style={styles.sceneContainer}>
          {/* Animated Scooter & Rider */}
          <Animated.View
            style={[
              styles.scooterWrapper,
              {
                transform: [
                  { translateX: scooterEntrance },
                  { translateY: scooterBob },
                  { rotate: tiltInterpolate },
                ],
              },
            ]}
          >
            <Image
              source={require('../assets/images/splash-rider.png')}
              style={styles.scooterImage}
              contentFit="contain"
            />
          </Animated.View>

          {/* Road & Motion Speed Lines */}
          <View style={styles.roadContainer}>
            {/* Main Road Line */}
            <View style={styles.roadBase} />

            {/* Animated Speed Dashes */}
            <Animated.View
              style={[
                styles.speedLineDash1,
                { transform: [{ translateX: roadLineTranslate1 }] },
              ]}
            />
            <Animated.View
              style={[
                styles.speedLineDash2,
                { transform: [{ translateX: roadLineTranslate2 }] },
              ]}
            />
          </View>
        </View>

        {/* Brand Text Section */}
        <Animated.View
          style={[
            styles.textSection,
            {
              opacity: textOpacity,
              transform: [{ scale: textScale }],
            },
          ]}
        >
          <Text style={styles.brandTitle}>AGTURONG</Text>
          <Text style={styles.brandSubtitle}>DELIVERY</Text>

          <Animated.View style={[styles.badgeContainer, { opacity: badgeOpacity }]}>
            <View style={styles.dot} />
            <Text style={styles.badgeText}>ALAMINOS CITY • PANGASINAN</Text>
            <View style={styles.dot} />
          </Animated.View>

          <Text style={styles.tagline}>Mabilis • Mainit • Masarap</Text>
        </Animated.View>

        {/* Bottom Loading Bar */}
        <View style={styles.bottomLoader}>
          <View style={styles.progressBarTrack}>
            <Animated.View
              style={[
                styles.progressBarFill,
                { width: progressInterpolate },
              ]}
            />
          </View>
          <Text style={styles.loadingText}>Loading delicious meals...</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#FFFFFF',
    zIndex: 99999,
  },
  touchArea: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.section,
  },
  backgroundCircleLarge: {
    position: 'absolute',
    top: -SCREEN_WIDTH * 0.35,
    right: -SCREEN_WIDTH * 0.25,
    width: SCREEN_WIDTH * 1.1,
    height: SCREEN_WIDTH * 1.1,
    borderRadius: (SCREEN_WIDTH * 1.1) / 2,
    backgroundColor: '#FFF4EC',
    opacity: 0.8,
  },
  backgroundCircleSmall: {
    position: 'absolute',
    bottom: -SCREEN_WIDTH * 0.2,
    left: -SCREEN_WIDTH * 0.2,
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7,
    borderRadius: (SCREEN_WIDTH * 0.7) / 2,
    backgroundColor: '#FFF8F3',
    opacity: 0.9,
  },
  sceneContainer: {
    marginTop: SCREEN_HEIGHT * 0.08,
    alignItems: 'center',
    justifyContent: 'center',
    width: SCREEN_WIDTH,
  },
  scooterWrapper: {
    width: SCREEN_WIDTH * 0.75,
    height: SCREEN_WIDTH * 0.75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scooterImage: {
    width: '100%',
    height: '100%',
  },
  roadContainer: {
    width: SCREEN_WIDTH * 0.85,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -Spacing.md,
    overflow: 'hidden',
  },
  roadBase: {
    position: 'absolute',
    width: '100%',
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    bottom: 2,
  },
  speedLineDash1: {
    position: 'absolute',
    width: 60,
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    bottom: 2,
    left: '40%',
  },
  speedLineDash2: {
    position: 'absolute',
    width: 35,
    height: 4,
    backgroundColor: Colors.primaryLight,
    borderRadius: 2,
    bottom: 2,
    left: '75%',
  },
  textSection: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginTop: -Spacing.lg,
  },
  brandTitle: {
    fontSize: 38,
    fontWeight: FontWeight.extrabold,
    color: Colors.primary,
    letterSpacing: 3,
    textAlign: 'center',
  },
  brandSubtitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    letterSpacing: 6,
    marginTop: -4,
    textAlign: 'center',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0EA',
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: '#FFE0CF',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.primary,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.primaryDark,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
  bottomLoader: {
    width: SCREEN_WIDTH * 0.65,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  progressBarTrack: {
    width: '100%',
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  loadingText: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: Spacing.sm,
    fontWeight: FontWeight.medium,
  },
});
