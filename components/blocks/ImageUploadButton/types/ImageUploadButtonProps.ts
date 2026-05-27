import {ImageStyle, StyleProp} from 'react-native';

export interface ImageUploadButtonProps {
  value: string | null;
  style?: StyleProp<ImageStyle>;
  className?: string;
  onChange?: (value: string) => void;
  onRemove?: () => void;
}
