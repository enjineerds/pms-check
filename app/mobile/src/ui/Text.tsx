import { Text as RNText, type TextProps } from 'react-native';
import { cx } from './cx';

export type Weight = 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';
export type Variant = 'display' | 'title' | 'lead' | 'read' | 'body' | 'small' | 'caption';
export type TextColor = 'ink' | 'ink-soft' | 'ink-faint' | 'panel-ink' | 'panel-soft' | 'required' | 'optional' | 'skip';

const VARIANT: Record<Variant, { size: string; weight: Weight }> = {
  display: { size: 'text-display', weight: 'extrabold' },
  title: { size: 'text-title', weight: 'bold' },
  lead: { size: 'text-lead', weight: 'medium' },
  read: { size: 'text-read', weight: 'regular' },
  body: { size: 'text-body', weight: 'medium' },
  small: { size: 'text-small', weight: 'regular' },
  caption: { size: 'text-caption', weight: 'medium' },
};

const FONT: Record<Weight, string> = {
  regular: 'font-regular',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
};

const COLOR: Record<TextColor, string> = {
  ink: 'text-ink',
  'ink-soft': 'text-ink-soft',
  'ink-faint': 'text-ink-faint',
  'panel-ink': 'text-panel-ink',
  'panel-soft': 'text-panel-soft',
  required: 'text-required',
  optional: 'text-optional',
  skip: 'text-skip',
};

interface Props extends TextProps {
  variant?: Variant;
  weight?: Weight;
  color?: TextColor;
}

export function Text({ variant = 'body', weight, color = 'ink', className, ...rest }: Props) {
  const v = VARIANT[variant];
  return <RNText {...rest} className={cx(v.size, FONT[weight ?? v.weight], COLOR[color], className)} />;
}
