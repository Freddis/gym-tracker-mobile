import {FC, useState} from 'react';
import {useAppTheme} from '../../../hooks/useAppTheme';
import {IconSymbol} from '../IconSymbol/IconSymbol';
import {ThemedView} from '../ThemedView/ThemedView';
import {Theme} from '../../../types/Colors';
import {
  StyleSheet,
  Pressable,
  View,
  Alert,
} from 'react-native';
import {
  requestCameraPermissionsAsync,
  requestMediaLibraryPermissionsAsync,
} from 'expo-image-picker';
import {ImageUploadButtonProps} from './types/ImageUploadButtonProps';
import {openPicker, openCamera, Options} from 'react-native-image-crop-picker';
import {ThemedImage} from '../ThemedImage/ThemedImage';

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      borderRadius: theme.borderRadiusS,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'flex-start',
      width: '100%',
      height: '100%',
    },
  });

export const ImageUploadButton: FC<ImageUploadButtonProps> = (props) => {
  const theme = useAppTheme();
  const styles = getStyles(theme);

  const [src, setSrc] = useState<string | null>(props.value);

  const handleResult = (result: string) => {
    props.onChange?.(result);
    setSrc(result);
    setSrc(`data:image/jpeg;base64,${result}`);
  };

  const openCameraOnPress = async () => {
    const permissionResult = await requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        'Permission required',
        'Permission to access the camera is required.',
      );
      return;
    }

    const options: Options = {
      mediaType: 'photo',
      cropping: true,
      width: 1500,
      height: 1500,
      forceJpg: true,
      compressImageMaxWidth: 1500,
      compressImageMaxHeight: 1500,
      includeBase64: true,
    };
    const cameraResult = await openCamera(options);
    if (!cameraResult.data) {
      return;
    }
    handleResult(cameraResult.data);
    // handleResult(result);
  };

  const openGallery = async () => {
    const permissionResult =
      await requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        'Permission required',
        'Permission to access the media library is required.',
      );
      return;
    }
    const options: Options = {
      mediaType: 'photo',
      cropping: true,
      width: 1500,
      height: 1500,
      forceJpg: true,
      compressImageMaxWidth: 1500,
      compressImageMaxHeight: 1500,
      includeBase64: true,
    };
    const result = await openPicker(options);

    if (!result.data) {
      return;
    }
    handleResult(result.data);
  };

  const onPress = async () => {
    Alert.alert(
      'Select Image',
      'Choose image source',
      [
        {
          text: 'Camera',
          onPress: openCameraOnPress,
        },
        {
          text: 'Gallery',
          onPress: openGallery,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
    );
  };

  const onRemovePress = () => {
    if (!props.onRemove) {
      return;
    }

    setSrc(null);
    props.onRemove();
  };

  return (
    <>
      <Pressable
        onPress={onPress}
        style={[props.style]}
        className={props.className}>
        <ThemedView style={styles.container}>
          {!src && (
            <View
              style={{
                padding: theme.paddingM,
                width: '50%',
                height: '50%',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <IconSymbol
                name="photo.badge.plus"
                size={50}
                color={theme.surfaceText}
              />
            </View>
          )}

          {src && (
            <ThemedImage
              source={{uri: src}}
              style={{
                height: '100%',
                width: '100%',
                // resizeMode: 'cover',
                borderRadius: theme.borderRadiusS,
              }}
            />
          )}

          {src && props.onRemove && (
            <Pressable onPress={onRemovePress} className="absolute -top-2 -right-2">
              <View style={{backgroundColor: theme.accent, padding: 4, borderRadius: 1000}}>
                <IconSymbol name="xmark" size={15} color={'white'} />
              </View>
            </Pressable>
          )}
        </ThemedView>
      </Pressable>
    </>
  );
};
