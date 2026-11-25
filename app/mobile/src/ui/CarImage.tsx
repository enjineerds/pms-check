import { View } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut, Keyframe, LayoutAnimationConfig, ReduceMotion, useReducedMotion } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { withUniwind } from 'uniwind';
import { BODY_STYLE_LABEL } from '@/core/bodyStyle';
import type { BodyStyle } from '@/core/types';

const StyledImage = withUniwind(Image);

// Each body and its shadow share one canvas, so `contain` keeps them registered.
const SOURCES: Record<BodyStyle, { body: number; shadow: number }> = {
  sedan: { body: require('../../assets/images/cars/sedan.webp'), shadow: require('../../assets/images/cars/sedan-shadow.webp') },
  hatchback: { body: require('../../assets/images/cars/hatchback.webp'), shadow: require('../../assets/images/cars/hatchback-shadow.webp') },
  suv: { body: require('../../assets/images/cars/suv.webp'), shadow: require('../../assets/images/cars/suv-shadow.webp') },
  mpv: { body: require('../../assets/images/cars/mpv.webp'), shadow: require('../../assets/images/cars/mpv-shadow.webp') },
  pickup: { body: require('../../assets/images/cars/pickup.webp'), shadow: require('../../assets/images/cars/pickup-shadow.webp') },
};

export const CAR_ARRIVE_MS = 560;
const DRIVE = Easing.bezier(0.16, 1, 0.3, 1);

// The renders face front-left, so every car arrives and leaves driving forward.
const drive = (delay: number) =>
  new Keyframe({
    0: { opacity: 0, transform: [{ translateX: 40 }] },
    35: { opacity: 1, transform: [{ translateX: 9 }], easing: DRIVE },
    78: { opacity: 1, transform: [{ translateX: 0 }], easing: DRIVE },
    100: { opacity: 1, transform: [{ translateX: 0 }] },
  })
    .duration(CAR_ARRIVE_MS)
    .delay(delay);

// Only the body dips as it stops; the shadow stays on the ground.
const settle = (delay: number) =>
  new Keyframe({
    0: { transform: [{ translateY: 0 }] },
    78: { transform: [{ translateY: 0 }] },
    88: { transform: [{ translateY: 1.5 }], easing: Easing.out(Easing.quad) },
    100: { transform: [{ translateY: 0 }], easing: Easing.inOut(Easing.quad) },
  })
    .duration(CAR_ARRIVE_MS)
    .delay(delay);

const LEAVE = new Keyframe({
  0: { opacity: 1, transform: [{ translateX: 0 }] },
  100: { opacity: 0, transform: [{ translateX: -40 }], easing: Easing.in(Easing.quad) },
}).duration(200);

const fadeIn = (delay: number) => FadeIn.duration(200).delay(delay).reduceMotion(ReduceMotion.Never);
const FADE_OUT = FadeOut.duration(150).reduceMotion(ReduceMotion.Never);

interface Props {
  style: BodyStyle;
  height: number;
  /** `arrive` drives the car in on mount; `swap` stays put on mount and drives a new car in when the style changes. */
  motion?: 'arrive' | 'swap';
  delay?: number;
}

export function CarImage({ style, height, motion, delay = 0 }: Props) {
  const reduceMotion = useReducedMotion();
  const { body, shadow } = SOURCES[style];
  const shadowImage = <StyledImage source={shadow} contentFit="contain" className="absolute inset-0" transition={150} accessible={false} />;
  const bodyImage = <StyledImage source={body} contentFit="contain" className="absolute inset-0" transition={150} accessibilityLabel={BODY_STYLE_LABEL[style]} />;

  if (!motion) {
    return (
      <View className="w-full" style={{ height }}>
        {shadowImage}
        {bodyImage}
      </View>
    );
  }
  return (
    <View className="w-full" style={{ height }}>
      <LayoutAnimationConfig skipEntering={motion === 'swap'}>
        <Animated.View
          key={style}
          className="absolute inset-0"
          entering={reduceMotion ? fadeIn(delay) : drive(delay)}
          exiting={reduceMotion ? FADE_OUT : LEAVE}
        >
          {shadowImage}
          <Animated.View className="absolute inset-0" entering={reduceMotion ? undefined : settle(delay)}>
            {bodyImage}
          </Animated.View>
        </Animated.View>
      </LayoutAnimationConfig>
    </View>
  );
}
