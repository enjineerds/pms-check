import { useRef, useState } from 'react';
import Animated, { Easing, ReduceMotion, useAnimatedProps, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Svg, { G, Line, Polyline, Rect } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';
import * as SplashScreen from 'expo-splash-screen';
import { useCSSVariable } from 'uniwind';

// Geometry of branding/svg/pms-check-icon-unchecked.svg, which app.json shows as the native splash.
const VEE = '15,15 87,119 159,15';
const VEE_LENGTH = 2 * Math.hypot(72, 104);

/** Matches app.json: iOS draws `imageWidth` as is; this OPPO draws Android's 144 at half size. */
const SPLASH_TILE = 72;

const HANDOFF_MS = 120;
const TICK_MS = 300;
const HOLD_MS = 120;
const LIFT_MS = 220;
const PEN = Easing.bezier(0.65, 0, 0.35, 1);
const LIFT = Easing.bezier(0.16, 1, 0.3, 1);

let leadMs = 0;
/** How long the splash covers the first screen, so its entrance can start as the splash lifts. */
export const splashLeadMs = () => leadMs;

const AnimatedPolyline = Animated.createAnimatedComponent(Polyline);

export function SplashTick({ onDone }: { onDone: () => void }) {
  const reduceMotion = useReducedMotion();
  const [panel, panelInk, guide, accent] = useCSSVariable(['--color-panel', '--color-panel-ink', '--color-mark-guide', '--color-accent']) as string[];
  const tickMs = reduceMotion ? 150 : TICK_MS;
  useState(() => {
    leadMs = HANDOFF_MS + tickMs + HOLD_MS;
  });
  const ink = useSharedValue(0);
  const lift = useSharedValue(0);
  const started = useRef(false);

  const start = () => {
    if (started.current) return;
    started.current = true;
    SplashScreen.setOptions({ duration: HANDOFF_MS, fade: true });
    SplashScreen.hideAsync();
    // Reduce Motion is handled below by fading instead of drawing, so these always run.
    ink.set(withDelay(HANDOFF_MS, withTiming(1, { duration: tickMs, easing: PEN, reduceMotion: ReduceMotion.Never }), ReduceMotion.Never));
    lift.set(
      withDelay(
        HANDOFF_MS + tickMs + HOLD_MS,
        withTiming(1, { duration: LIFT_MS, easing: LIFT, reduceMotion: ReduceMotion.Never }, (finished) => {
          if (finished) scheduleOnRN(finish);
        }),
        ReduceMotion.Never,
      ),
    );
  };
  const finish = () => {
    leadMs = 0;
    onDone();
  };

  // Reduce Motion: the V turns yellow in place instead of being drawn.
  const veeProps = useAnimatedProps(() =>
    reduceMotion
      ? { strokeDashoffset: 0, opacity: ink.get() }
      : { strokeDashoffset: VEE_LENGTH * (1 - ink.get()), opacity: ink.get() > 0 ? 1 : 0 },
  );
  const groundStyle = useAnimatedStyle(() => ({ opacity: 1 - lift.get() }));
  const tileStyle = useAnimatedStyle(() => ({ transform: [{ scale: reduceMotion ? 1 : 1 + 0.06 * lift.get() }] }));

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="absolute inset-0 items-center justify-center bg-ground"
      style={groundStyle}
      onLayout={start}
    >
      <Animated.View style={tileStyle}>
        <Svg width={SPLASH_TILE} height={SPLASH_TILE} viewBox="0 0 256 256">
          <Rect width={256} height={256} rx={58} fill={panel} />
          <G transform="translate(74.24 70.40) scale(0.6179)" strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Line x1={15} y1={15} x2={15} y2={159} stroke={panelInk} />
            <Line x1={159} y1={15} x2={159} y2={159} stroke={panelInk} />
            <Polyline points={VEE} stroke={guide} />
            <AnimatedPolyline points={VEE} stroke={accent} strokeDasharray={[VEE_LENGTH, VEE_LENGTH]} animatedProps={veeProps} />
          </G>
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}

