import {FC} from 'react';
import FastImage from '@d11/react-native-fast-image';
import {cn} from '../../../cn';
import {NwFastImage, NwFastImageProps} from '../../nativewind/NwFastImage/NwFastImage';


export const ThemedImage: FC<NwFastImageProps> = (props) => {
  const {className, source, ...rest} = props;
  return (
    <NwFastImage
    className={cn('w-20 h-20 rounded-md object-cover', className)}
    source={{
      uri: typeof props.source === 'object' && 'uri' in props.source ? props.source.uri : undefined,
      priority: FastImage.priority.high,
      cache: FastImage.cacheControl.immutable,
    }}
    resizeMode={FastImage.resizeMode.cover}
    {...rest}
  />
  );
};
