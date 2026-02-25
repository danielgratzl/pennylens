import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useAppStore } from "@/store/appStore";
import { useSankeyData } from "@/hooks/useSankeyData";
import { ViewModeToggle } from "@/components/ViewModeToggle";
import { SankeyDiagram } from "@/components/SankeyDiagram";
import { Colors } from "@/constants/colors";
import { currentMonth } from "@/utils/month";

export default function SankeyScreen() {
  const { activePortfolioId, viewMode } = useAppStore();
  const sankeyData = useSankeyData(activePortfolioId, currentMonth(), viewMode);
  const [diagramSize, setDiagramSize] = useState<{ width: number; height: number } | null>(null);

  return (
    <View style={styles.container}>
      <ViewModeToggle />
      <View
        style={styles.diagramContainer}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          setDiagramSize({ width: width, height: height });
        }}
      >
        {diagramSize && (
          <SankeyDiagram data={sankeyData} width={diagramSize.width} height={diagramSize.height} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  diagramContainer: {
    flex: 1,
  },
});
