import FastImage from '@d11/react-native-fast-image';
import {styled} from 'nativewind';
import {ComponentProps} from 'react';

export const NwFastImage = styled(FastImage, {
  className: 'style',
});

export type NwFastImageProps = ComponentProps<typeof NwFastImage>;
