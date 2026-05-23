import {FC} from 'react';
import {ImageProps, Image} from 'react-native';
import {cn} from '../../../cn';

export const ThemedImage: FC<ImageProps> = (props) => {
  const {style, ...rest} = props;
  return (
    <Image className={cn('h-20 w-20 rounded-md object-cover', props.className)} {...rest} />
  );
};
