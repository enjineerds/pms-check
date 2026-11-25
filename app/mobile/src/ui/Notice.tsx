import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';
import { cx } from './cx';

type Tone = 'green' | 'amber' | 'red';

const TONES: Record<Tone, { bg: string; accent: string; icon: IconName }> = {
  green: { bg: 'bg-required-bg', accent: 'accent-required', icon: 'check' },
  amber: { bg: 'bg-optional-bg', accent: 'accent-optional', icon: 'warning' },
  red: { bg: 'bg-skip-bg', accent: 'accent-skip', icon: 'warning' },
};

interface Props {
  tone: Tone;
  icon?: IconName;
  children: ReactNode;
}

export function Notice({ tone, icon, children }: Props) {
  const t = TONES[tone];
  return (
    <View className={cx('flex-row items-center gap-3 rounded-[20px] px-4 py-3.5', t.bg)}>
      <Icon name={icon ?? t.icon} size={18} colorClassName={t.accent} stroke={2.2} />
      <Text variant="small" className="flex-1">
        {children}
      </Text>
    </View>
  );
}
