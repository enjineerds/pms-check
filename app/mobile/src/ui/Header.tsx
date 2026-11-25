import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Icon } from './Icon';
import { Text } from './Text';

interface Props {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  noBack?: boolean;
}

export function Header({ title, subtitle, onBack, noBack }: Props) {
  const back = () => (onBack ? onBack() : router.canGoBack() ? router.back() : router.replace('/'));
  return (
    <View className="min-h-11 flex-row items-center gap-3 px-page">
      {noBack ? null : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={back}
          className="size-10 items-center justify-center rounded-full bg-surface shadow-soft"
        >
          <Icon name="chevron-left" size={18} stroke={2.4} />
        </Pressable>
      )}
      <View className="flex-1">
        <Text variant="lead" weight="bold" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="small" color="ink-faint" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
