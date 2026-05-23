import {Link, Stack} from 'expo-router';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {ThemedView} from '@/components/blocks/ThemedView/ThemedView';
import {FC} from 'react';

export const NotFoundScreen: FC = () => {
  return (
    <>
      <Stack.Screen options={{title: 'Oops!'}} />
      <ThemedView className="flex-1 items-center justify-center p-m">
        <ThemedText >This screen doesn&apos;t exist.</ThemedText>
        <Link href="/" className="mt-s py-2">
          <ThemedText className="text-accent">Go to home screen!</ThemedText>
        </Link>
      </ThemedView>
    </>
  );
};
