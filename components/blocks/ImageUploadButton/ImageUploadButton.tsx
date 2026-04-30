import {FC} from 'react';
import {useAppTheme} from '../../../hooks/useAppTheme';
import {IconSymbol} from '../IconSymbol/IconSymbol';
import {ThemedView} from '../ThemedView/ThemedView';
import {Theme} from '../../../types/Colors';
import {StyleSheet, Pressable, View, Alert, Image} from 'react-native';
import {ThemedButton} from '../ThemedButton/ThemedButton';
import {requestMediaLibraryPermissionsAsync, launchImageLibraryAsync} from 'expo-image-picker';
import {ImageUploadButtonProps} from './types/ImageUploadButtonProps';

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    borderRadius: theme.borderRadiusS,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
});

export const ImageUploadButton: FC<ImageUploadButtonProps> = (props) => {
  const theme = useAppTheme();
  const styles = getStyles(theme);
  const onPress = async () => {
    const permissionResult = await requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Permission to access the media library is required.');
      return;
    }
    const result = await launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      base64: true,
      selectionLimit: 1,
    });
    if (!result.canceled && result.assets[0]?.base64) {
      props.onChange?.(result.assets[0].base64);
    }
  };
  const onRemovePress = () => {
    if (!props.onRemove) {
      return;
    }
    props.onRemove();
  };
  return (
    <>
      <Pressable onPress={onPress} style={[props.style]}>
        <ThemedView style={styles.container}>
        {!props.value && (
          <View style={{padding: theme.paddingM, width: '50%', height: '50%', alignItems: 'center', justifyContent: 'center'}}>
            <IconSymbol name="photo.badge.plus" size={50} color={theme.surfaceText} />
          </View>
          )}
        {props.value && <Image src={props.value} style={{height: '100%', width: '100%', resizeMode: 'cover'}} />}
        {props.value && props.onRemove && <ThemedButton style={{position: 'absolute', bottom: 10}} onPress={onRemovePress}>Remove</ThemedButton>}
        </ThemedView>
      </Pressable>
    </>
  );
};
