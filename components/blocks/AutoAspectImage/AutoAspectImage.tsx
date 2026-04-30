import {FC, useState} from 'react';
import {ImageProps, StyleProp, ImageStyle, ImageLoadEvent, Image} from 'react-native';

export const AutoAspectImage: FC<ImageProps> = (props) => {
  const [ratio, setRatio] = useState<number>(1);

  const imageStyle: StyleProp<ImageStyle> = {
    aspectRatio: ratio,
    width: null,
  };

  const onLoad = (e: ImageLoadEvent) => {
    const {width: w, height: h} = e.nativeEvent.source;
    console.log('w', w, 'h', h);
    setRatio(w / h);
  };

  return <Image {...props} style={[props.style, imageStyle]} onLoad={onLoad} />;
};
