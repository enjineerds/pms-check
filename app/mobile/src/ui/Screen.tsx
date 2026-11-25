import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  header?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  overlay?: ReactNode;
  scroll?: boolean;
  flushBottom?: boolean;
}

export function Screen({ header, children, footer, overlay, scroll, flushBottom }: Props) {
  const insets = useSafeAreaInsets();
  const Body = scroll ? ScrollView : View;
  const bodyInset = footer ? undefined : { paddingBottom: insets.bottom };
  return (
    <View className="flex-1 bg-ground">
      <View className="absolute inset-0 bg-linear-to-b/srgb from-surface from-0% to-ground to-45%" />
      <View style={{ paddingTop: insets.top + 8 }}>{header}</View>
      <Body
        className="flex-1"
        {...(scroll ? { contentContainerClassName: 'grow px-page pt-2', contentContainerStyle: bodyInset, showsVerticalScrollIndicator: false } : {})}
      >
        {scroll ? children : <View className="grow px-page pt-2" style={bodyInset}>{children}</View>}
      </Body>
      {footer ? (
        <View className="gap-3 px-page pt-2" style={{ paddingBottom: flushBottom ? 12 : Math.max(insets.bottom, 12) + 4 }}>
          {footer}
        </View>
      ) : null}
      {overlay}
    </View>
  );
}
