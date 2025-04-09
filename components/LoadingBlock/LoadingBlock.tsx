import { FC, ReactNode } from "react";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";

export const LoadingBlock: FC<{children?: ReactNode}> = (props) => {
  return (
    <ThemedView style={{ paddingTop: 70, flexDirection: "column", gap: 8, flex: 1 }}>
      {props.children}
      <ThemedText style={{ paddingTop: 70, textAlign: "center" }}>
        Loading...
      </ThemedText>
    </ThemedView>
  );
};
