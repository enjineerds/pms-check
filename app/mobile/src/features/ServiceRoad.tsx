import { View } from 'react-native';
import Animated, { cubicBezier, type CSSAnimationProperties } from 'react-native-reanimated';

interface Props {
  /** 0–1: where the car sits between this service and the next. */
  progress: number;
  /** Drive the fill in from the start of the road, in step with the car's arrival. */
  animate: boolean;
}

// The odometer as a road: this service at the left end, the next at the right, the car's position marked.
// Decorative: the card's text already says the same thing, so screen readers skip it.
export function ServiceRoad({ progress, animate }: Props) {
  const pct = `${Math.round(progress * 100)}%` as const;
  const drive: CSSAnimationProperties | undefined = animate
    ? {
        animationName: { from: { width: '0%' }, to: { width: pct } },
        animationDuration: '700ms',
        animationTimingFunction: cubicBezier(0.16, 1, 0.3, 1),
      }
    : undefined;
  return (
    <View className="h-2.5 justify-center" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View className="h-1 rounded-full bg-line" />
      <Animated.View className="absolute left-0 h-1 flex-row items-center justify-end rounded-full bg-ink" style={[{ width: pct }, drive]}>
        <View className="-mr-1.25 size-2.5 rounded-full border-2 border-surface bg-ink" />
      </Animated.View>
      <View className="absolute right-0 size-1.5 rounded-full bg-ink-faint" />
    </View>
  );
}
