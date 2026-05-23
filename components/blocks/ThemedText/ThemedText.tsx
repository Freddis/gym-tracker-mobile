import {Text, type TextProps} from 'react-native';
import {cn} from '../../../cn';

export type ThemedTextProps = TextProps & {

};

export function ThemedText({
  className,
  ...rest
}: ThemedTextProps) {

  return (
    <Text className={cn('text-on-main', className)} {...rest} />
  );
}


