import { View } from 'react-native';
import Animated, { cubicBezier, type CSSAnimationProperties } from 'react-native-reanimated';

interface Props {
  progress: number;
  animate: boolean;
  delayMs?: number;
}

const DRIVE: CSSAnimationProperties = {
  animationName: {
    from: { transform: [{ translateX: '-100%' }] },
    to: { transform: [{ translateX: '0%' }] },
  },
  animationDuration: '700ms',
  animationFillMode: 'backwards',
  animationTimingFunction: cubicBezier(0.16, 1, 0.3, 1),
};

export function ServiceRoad({ progress, animate, delayMs = 0 }: Props) {
  const pct = `${Math.round(progress * 100)}%` as const;
  const drive: CSSAnimationProperties | undefined = animate ? { ...DRIVE, animationDelay: `${delayMs}ms` } : undefined;
  return (
    <View className="h-2.5 justify-center" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View className="h-1 overflow-hidden rounded-full bg-line">
        <Animated.View className="h-full rounded-full bg-ink" style={[{ width: pct }, drive]} />
      </View>
      {/* Unclipped: the marker overhangs the road. */}
      <Animated.View className="absolute left-0 flex-row justify-end" style={[{ width: pct }, drive]}>
        <View className="-mr-1.25 size-2.5 rounded-full border-2 border-surface bg-ink" />
      </Animated.View>
      <View className="absolute right-0 size-1.5 rounded-full bg-ink-faint" />
    </View>
  );
}
