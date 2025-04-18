import {ThemedTextProps} from '@/components/blocks/ThemedText/ThemedText';

export interface TimerBlockProps extends ThemedTextProps {
  start?: Date
  end?: Date
}
