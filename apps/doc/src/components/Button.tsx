import clsx from 'clsx';
import Link, { LinkProps } from 'next/link';

const styles = {
  primary:
    'rounded-full bg-sky-300 py-2 px-4 text-sm font-semibold text-slate-900 hover:bg-sky-200 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300/50 active:bg-sky-500',
  secondary:
    'rounded-full bg-slate-800 py-2 px-4 text-sm font-medium text-white hover:bg-slate-700 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 active:text-slate-400',
} as const;

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

type ButtonOrLinkProps<T extends boolean> = T extends true
  ? ButtonProps & LinkProps
  : ButtonProps;

interface ExistedButtonProps {
  variant?: keyof typeof styles;
  className?: string;
  href?: string;
}

export function Button<T extends boolean>({
  variant = 'primary',
  className,
  href,
  ...props
}: ExistedButtonProps & ButtonOrLinkProps<T>) {
  className = clsx(styles[variant], className);

  return href ? (
    <Link
      href={href}
      className={className}
      {...(props as Omit<LinkProps, 'href'>)}
    />
  ) : (
    <button className={className} {...props} />
  );
}
