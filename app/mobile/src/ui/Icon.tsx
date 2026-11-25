import Svg, { Path } from 'react-native-svg';
import { withUniwind } from 'uniwind';

const StyledSvg = withUniwind(Svg, {
  stroke: { fromClassName: 'strokeClassName', styleProperty: 'accentColor' },
});

// Same family as landing-page/src/components/Icon.astro: 24px grid, round caps.
const paths = {
  check: 'M5 12.5l4.5 4.5L19 7',
  question: 'M9.2 9.2a2.9 2.9 0 1 1 4.1 2.6c-.8.4-1.3 1.1-1.3 2v.4M12 17.6v.1',
  x: 'M7 7l10 10M17 7L7 17',
  'chevron-left': 'M14.5 6l-6 6 6 6',
  'chevron-right': 'M9.5 6l6 6-6 6',
  car: 'M5 15.5V12l1.8-4.2A2 2 0 0 1 8.6 6.6h6.8a2 2 0 0 1 1.8 1.2L19 12v3.5M4 15.5h16v2.5H4zM7.5 18v1.5M16.5 18v1.5M5 12h14',
  flash: 'M13 3L6 13.5h5.5L10.5 21 18 10.5h-5.5z',
  copy: 'M9 9h10v10H9zM5 15V5h10',
  doc: 'M7 4h10v16H7zM10 9h4M10 13h4',
  clock: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM12 8v4l2.5 1.5',
  globe: 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zM3.5 12h17M12 3.5c2.4 2.4 3.6 5.2 3.6 8.5s-1.2 6.100-3.6 8.500c-2.400-2.400-3.600-5.200-3.600-8.500S9.600 5.900 12 3.500z',
  camera: 'M4 8.500A1.500 1.500 0 0 1 5.500 7H8l1.200-2h5.600L16 7h2.500A1.500 1.500 0 0 1 20 8.500v9a1.500 1.500 0 0 1-1.500 1.500h-13A1.500 1.500 0 0 1 4 17.500zM12 10a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  'camera-off': 'M4 8.500A1.500 1.500 0 0 1 5.500 7H8l1.200-2h5.600L16 7h2.500A1.500 1.500 0 0 1 20 8.500v9a1.500 1.500 0 0 1-1.500 1.500h-13A1.500 1.500 0 0 1 4 17.500zM12 10a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM4 4l16 16',
  image: 'M5 5h14v14H5zM5 16l4.500-4.500L14 16l2-2 3 3M15.500 9.500v.1',
  lines: 'M6 8h12M6 12h12M6 16h8',
  search: 'M11 4.500a6.500 6.500 0 1 0 0 13 6.500 6.500 0 0 0 0-13zM16 16l4 4',
  plus: 'M12 5v14M5 12h14',
  trash: 'M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12M10.500 10.500v5M13.500 10.500v5',
  warning: 'M12 4L3 19h18zM12 10v4M12 16.500v.1',
  sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 3v2M12 19v2M3 12h2M19 12h2M5.600 5.600L7 7M17 17l1.400 1.400M5.600 18.400L7 17M17 7l1.400-1.400',
  expand: 'M4 9V5h4M20 9V5h-4M4 15v4h4M20 15v4h-4',
  pencil: 'M5 19l.8-3.800L15.500 5.500a1.800 1.800 0 0 1 2.500 0l.5.5a1.800 1.800 0 0 1 0 2.500L8.800 18.200zM13.500 7.500l3 3',
  radio: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  backspace: 'M9 6h10v12H9l-5-6zM12 9.500l4 5M16 9.500l-4 5',
  clear: 'M8 8l8 8M16 8l-8 8',
  receipt: 'M7 4h10v16l-2-1.500-1.500 1.500L12 18.500 10.500 20 9 18.500 7 20zM10 9h4M10 13h4',
} as const;

export type IconName = keyof typeof paths;

interface Props {
  name: IconName;
  size?: number;
  /** An `accent-*` class from the theme, e.g. `accent-ink-soft`. */
  colorClassName?: string;
  stroke?: number;
}

export function Icon({ name, size = 20, colorClassName = 'accent-ink', stroke = 2.4 }: Props) {
  return (
    <StyledSvg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      strokeClassName={colorClassName}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d={paths[name]} />
    </StyledSvg>
  );
}
