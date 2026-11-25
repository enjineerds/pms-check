import { View } from 'react-native';
import type { VerdictKind } from '@/core/types';
import { Icon, type IconName } from './Icon';
import { VERDICT } from './verdict';
import { cx } from './cx';

const ICON: Record<VerdictKind, IconName> = { yes: 'check', ask: 'question', no: 'x' };

export function VerdictDisc({ kind, size = 36 }: { kind: VerdictKind; size?: number }) {
  const c = VERDICT[kind];
  return (
    <View className={cx('items-center justify-center', c.bg)} style={{ width: size, height: size, borderRadius: size / 2 }}>
      <Icon name={ICON[kind]} size={size * 0.46} colorClassName={c.accent} stroke={2.6} />
    </View>
  );
}
