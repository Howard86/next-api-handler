import clsx from 'clsx';
import { useId } from 'react';

import { InstallationIcon } from '@/components/icons/InstallationIcon';
import { LightbulbIcon } from '@/components/icons/LightbulbIcon';
import { PluginsIcon } from '@/components/icons/PluginsIcon';
import { PresetsIcon } from '@/components/icons/PresetsIcon';
import { ThemingIcon } from '@/components/icons/ThemingIcon';
import { WarningIcon } from '@/components/icons/WarningIcon';

const icons = {
  installation: InstallationIcon,
  presets: PresetsIcon,
  plugins: PluginsIcon,
  theming: ThemingIcon,
  lightbulb: LightbulbIcon,
  warning: WarningIcon,
} as const;

export type IconType = keyof typeof icons;

const iconStyles = {
  blue: '[--icon-foreground:theme(colors.slate.900)] [--icon-background:theme(colors.white)]',
  amber:
    '[--icon-foreground:theme(colors.amber.900)] [--icon-background:theme(colors.amber.100)]',
} as const;

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  icon: IconType;
  color?: keyof typeof iconStyles;
}

export function Icon({ color = 'blue', icon, className, ...props }: IconProps) {
  const id = useId();
  const IconComponent = icons[icon];

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      fill="none"
      className={clsx(className, iconStyles[color])}
      {...props}
    >
      <IconComponent id={id} color={color} />
    </svg>
  );
}

const gradients = {
  blue: [
    { stopColor: '#0EA5E9' },
    { stopColor: '#22D3EE', offset: '.527' },
    { stopColor: '#818CF8', offset: 1 },
  ],
  amber: [
    { stopColor: '#FDE68A', offset: '.08' },
    { stopColor: '#F59E0B', offset: '.837' },
  ],
};

export interface GradientProps
  extends React.SVGProps<SVGRadialGradientElement> {
  color?: keyof typeof gradients;
}

export function Gradient({ color = 'blue', ...props }: GradientProps) {
  return (
    <radialGradient
      cx={0}
      cy={0}
      r={1}
      gradientUnits="userSpaceOnUse"
      {...props}
    >
      {gradients[color].map((stop, stopIndex) => (
        <stop key={stopIndex} {...stop} />
      ))}
    </radialGradient>
  );
}

export type ModeProps = React.SVGProps<SVGGElement>;

export function LightMode({ className, ...props }: ModeProps) {
  return <g className={clsx('dark:hidden', className)} {...props} />;
}

export function DarkMode({ className, ...props }: ModeProps) {
  return <g className={clsx('hidden dark:inline', className)} {...props} />;
}
