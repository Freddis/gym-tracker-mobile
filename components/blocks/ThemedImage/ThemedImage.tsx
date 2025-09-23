import {FC} from 'react';
import {StyleProp, ImageStyle, ImageProps, Image} from 'react-native';

const imgStyle: StyleProp<ImageStyle> = {
  width: 70,
  height: 70,
  borderRadius: 5,
  paddingLeft: 0,
  objectFit: 'cover',
};

export const ThemedImage: FC<ImageProps> = (props) => {
  const {style, ...rest} = props;
  return (
    <Image style={[imgStyle, style]} {...rest} />
  );
};
