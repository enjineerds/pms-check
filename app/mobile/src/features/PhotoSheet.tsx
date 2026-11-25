import { Pressable, View } from 'react-native';
import { cx, Sheet, Text } from '@/ui';

interface Props {
  visible: boolean;
  onClose: () => void;
  onPick: (index: number) => void;
}

const BLURRY = 2;

export function PhotoSheet({ visible, onClose, onPick }: Props) {
  return (
    <Sheet visible={visible} onClose={onClose}>
      <View className="flex-row items-center justify-between">
        <Text variant="title" className="!text-[20px] !leading-[26px]">
          Choose a photo
        </Text>
        <Pressable accessibilityRole="button" onPress={onClose}>
          <Text variant="small" weight="semibold" color="ink-soft">
            Cancel
          </Text>
        </Pressable>
      </View>
      <Text variant="small" weight="bold" className="my-3">
        Recents
      </Text>
      <View className="flex-row flex-wrap gap-2.5">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Pressable key={i} accessibilityRole="button" accessibilityLabel={`Photo ${i + 1}`} onPress={() => onPick(i)} className="h-19.5 w-[31.5%] gap-1.5 rounded-[18px] border border-line bg-surface px-3 pt-3">
            <View className={cx('h-1.5 w-[55%] rounded-[3px]', i === BLURRY ? 'bg-blurry' : 'bg-ink')} />
            {[0, 1, 2].map((r) => (
              <View key={r} className={cx('h-[5px] rounded-[3px] bg-line', i === BLURRY && 'opacity-60')} />
            ))}
            {i === BLURRY ? (
              <View className="absolute bottom-2 left-2.5 rounded-sm bg-skip-bg px-1.5 py-px">
                <Text variant="caption" weight="bold" color="skip" className="!text-[10px]">
                  Blurry
                </Text>
              </View>
            ) : null}
          </Pressable>
        ))}
      </View>
      <Text variant="small" color="ink-soft" className="mb-10 mt-4">
        The sharpest photo of the whole quote works best.
      </Text>
    </Sheet>
  );
}
