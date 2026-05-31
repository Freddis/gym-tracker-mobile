import {View, type ViewProps, StyleSheet} from 'react-native';
import {FC} from 'react';
import {useAppTheme} from '@/hooks/useAppTheme';
import {Theme} from '@/types/Colors';
import {ThemedImage} from '../ThemedImage/ThemedImage';

const styled = (theme: Theme, image?: string, imageHeight?: number) => StyleSheet.create({
  container: {
    backgroundColor: theme.surface,
    padding: image ? 0 : theme.paddingM,
    borderRadius: theme.borderRadiusM,
    boxShadow: '0px 4px 4px -2px rgba(0,0,0, 0.1)',
  },
  image: {
    width: '100%',
    borderTopLeftRadius: theme.borderRadiusM,
    borderTopRightRadius: theme.borderRadiusM,
    height: imageHeight,
    // backgroundColor: 'red',
  },
});

export const ThemedBlock: FC<ViewProps & {image?: string, imageHeight?: number}> = (props) => {
  const {style, children, ...rest} = props;
  const theme = useAppTheme();
  const styles = styled(theme, props.image, props.imageHeight);
  return <View style={[styles.container, style]} {...rest}>
    {props.image && (
      <ThemedImage source={{uri: props.image}} className={'w-full'} style={{height: props.imageHeight}} />
    )}
    <View style={{padding: props.image ? theme.paddingM : 0}}>
    {children}
    </View>
    </View>;
};
