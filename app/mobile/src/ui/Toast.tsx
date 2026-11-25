import { Pressable, View } from 'react-native';
import { useCSSVariable } from 'uniwind';
import { useCopy } from '@/i18n';
import { Gradient } from './Gradient';
import { Text } from './Text';

interface Props {
  message: string;
  onUndo?: () => void;
}

export function Toast({ message, onUndo }: Props) {
  const t = useCopy().common;
  const [from, to] = useCSSVariable(['--color-panel', '--color-gloss-toast']) as [string, string];
  return (
    <View className="h-11 flex-row items-center overflow-hidden rounded-pill pl-4 pr-1.5 shadow-toast">
      <Gradient colors={[from, to]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="absolute inset-0" />
      <Text variant="small" weight="medium" color="panel-ink" className="flex-1" numberOfLines={1}>
        {message}
      </Text>
      {onUndo ? (
        <Pressable accessibilityRole="button" onPress={onUndo} className="h-8 justify-center rounded-pill bg-panel-line px-3.5">
          <Text variant="small" weight="bold" color="panel-ink">
            {t.undo}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
