import {View, type ViewProps, StyleSheet, Image} from 'react-native';
import {FC} from 'react';
import {useAppTheme} from '@/hooks/useAppTheme';
import {Theme} from '@/types/Colors';

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
      // <AutoAspectImage source={{uri: props.image}} style={{width: '100%', height: 100}} />
      <Image src={props.image} style={styles.image} />
    )}
    <View style={{padding: props.image ? theme.paddingM : 0}}>
    {children}
    </View>
    </View>;
};
