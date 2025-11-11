import { Text, type TextProps } from 'react-native';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
  className?: string;
};

export function ThemedText({
  className,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const typeClasses = {
    default: 'text-base leading-6 text-foreground',
    defaultSemiBold: 'text-base leading-6 font-semibold text-foreground',
    title: 'text-[32px] leading-8 font-bold text-foreground',
    subtitle: 'text-xl font-bold text-foreground',
    link: 'text-base leading-[30px] text-info',
  };

  return (
    <Text
      className={`${typeClasses[type]} ${className || ''}`}
      {...rest}
    />
  );
}
