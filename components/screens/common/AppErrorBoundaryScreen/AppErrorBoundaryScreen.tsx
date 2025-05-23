import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {Component, ReactNode} from 'react';

export class AppErrorBoundaryScreen extends Component<{children: ReactNode}, {hasError: boolean}> {

  constructor(props: {children: number}) {
    super(props);
    this.state = {hasError: false};
  }

  static getDerivedStateFromError(e: unknown) {
    return {hasError: true};
  }

  override componentDidCatch(e: unknown, enfo: unknown) {
    return;
  }

  override render() {
    if (this.state.hasError) {
      return <ThemedText style={{paddingTop: 70}}>Caught a bad error on this page</ThemedText>;
    }
    return this.props.children;
  }
}
