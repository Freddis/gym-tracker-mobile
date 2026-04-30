import {ImageStyle, StyleProp} from 'react-native';

export interface ImageUploadButtonProps {
  value: string | null;
  style: StyleProp<ImageStyle>;
  onChange?: (value: string) => void;
  onRemove?: () => void;
}
