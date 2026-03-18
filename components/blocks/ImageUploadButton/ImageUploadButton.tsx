import {FC, useState} from 'react';
import {useAppTheme} from '../../../hooks/useAppTheme';
import {IconSymbol} from '../IconSymbol/IconSymbol';
import {ThemedView} from '../ThemedView/ThemedView';
import {Theme} from '../../../types/Colors';
import {StyleSheet, Image, StyleProp, ImageStyle, ImageLoadEvent, ImageProps} from 'react-native';


const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    borderRadius: theme.borderRadiusS,
    borderWidth: 1,
    borderColor: theme.surfaceText,
    flexShrink: 1,
    flexGrow: 0,
    padding: theme.paddingM,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
});

const AutoAspectImage: FC<ImageProps> = (props) => {
  const [ratio, setRatio] = useState<number>(1);

  const imageStyle: StyleProp<ImageStyle> = {
    aspectRatio: ratio,
    width: null,
  };

  const onLoad = (e: ImageLoadEvent) => {
    const {width: w, height: h} = e.nativeEvent.source;
    setRatio(w / h);
  };

  return <Image {...props} style={[props.style, imageStyle]} onLoad={onLoad} />;
};

export const ImageUploadButton: FC<{value: string | undefined, style: StyleProp<ImageStyle>}> = (props) => {
  const theme = useAppTheme();
  const styles = getStyles(theme);
  return (
    <>
    {!props.value && (
      <ThemedView style={[styles.container, props.style]}>
        <IconSymbol name="photo.badge.plus" size={50} color={theme.surfaceText} />
      </ThemedView>)}
    {props.value && <AutoAspectImage src={props.value} style={props.style} />}
    </>
  );
};
