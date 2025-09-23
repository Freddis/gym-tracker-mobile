import {RoutePath} from '@/types/RoutePath';
import {useRouter} from 'expo-router';
import {FC, Fragment} from 'react';
import {Pressable, StyleSheet} from 'react-native';
import {IconSymbol} from '../IconSymbol/IconSymbol';
import {ThemedText} from '../ThemedText/ThemedText';
import {useAppTheme} from '@/hooks/useAppTheme';
import {Separator} from '../Separator/Separator';
import {ThemedBlock} from '../ThemedBlock/ThemedBlock';

interface ThemedButtonListProps {
  items: [string, RoutePath][];
}

export const ThemedButtonList: FC<ThemedButtonListProps> = ({items}) => {
  const router = useRouter();
  const theme = useAppTheme();

  return (
    <ThemedBlock>
      {items.map((item, i) => (
        <Fragment key={item[0]}>
          {i > 0 && <Separator />}
          <Pressable
            onPress={() => router.push(item[1])}
            style={({pressed}) => [styles.button, pressed && styles.buttonPressed]}
          >
            <ThemedText style={styles.text}>{item[0]}</ThemedText>
            <IconSymbol name="chevron.right" color={theme.accent} size={16} />
          </Pressable>
        </Fragment>
      ))}
    </ThemedBlock>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 30,
    flexGrow: 1,
  },
  buttonPressed: {
    opacity: 0.75,
  },
  text: {
    flexGrow: 1,
  },
});
