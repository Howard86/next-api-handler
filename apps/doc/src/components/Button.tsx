import clsx from 'clsx';
import Link, { LinkProps } from 'next/link';

const styles = {
  primary:
    'rounded-full bg-sky-300 py-2 px-4 text-sm font-semibold text-slate-900 hover:bg-sky-200 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300/50 active:bg-sky-500',
  secondary:
    'rounded-full bg-slate-800 py-2 px-4 text-sm font-medium text-white hover:bg-slate-700 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 active:text-slate-400',
} as const;

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
type DefaultLinkProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  'href'
>;

type ButtonOrLinkProps<
  IsLink extends boolean,
  IsExternal extends boolean = false
> = IsLink extends true
  ? IsExternal extends true
    ? DefaultLinkProps
    : ButtonProps & LinkProps
  : ButtonProps;

interface ExistedButtonProps {
  variant?: keyof typeof styles;
  className?: string;
  href?: string;
}

export function Button<T extends boolean, K extends boolean>({
  variant = 'primary',
  className,
  href,
  ...props
}: ExistedButtonProps & ButtonOrLinkProps<T, K>) {
  className = clsx(styles[variant], className);

  if (href)
    return href.startsWith('/') ? (
      <Link
        href={href}
        className={className}
        {...(props as Omit<LinkProps, 'href'>)}
      />
    ) : (
      <a
        target="_blank"
        rel="noopener"
        href={href}
        className={className}
        {...(props as DefaultLinkProps)}
      />
    );

  return <button className={className} {...(props as ButtonProps)} />;
}
