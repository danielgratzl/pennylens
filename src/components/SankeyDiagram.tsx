import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Rect, Path, Text as SvgText, G } from "react-native-svg";
import {
  sankey,
  sankeyLinkHorizontal,
  sankeyLeft,
  type SankeyNode as D3SankeyNode,
  type SankeyLink as D3SankeyLink,
} from "d3-sankey";
import { type SankeyData } from "@/hooks/useSankeyData";
import { Colors } from "@/constants/colors";
import { formatCents } from "@/utils/currency";

interface Props {
  data: SankeyData;
  width: number;
  height: number;
}

interface NodeDatum {
  id: string;
  name: string;
  color: string;
}

interface LinkDatum {
  source: string;
  target: string;
  value: number;
}

export function SankeyDiagram({ data, width, height }: Props) {
  const layout = useMemo(() => {
    if (data.nodes.length === 0 || data.links.length === 0) return null;

    const nodeIds = new Set(data.nodes.map((n) => n.id));

    const sankeyNodes = data.nodes.map((n) => ({ ...n }));
    const sankeyLinks = data.links
      .filter((l) => nodeIds.has(l.source) && nodeIds.has(l.target) && l.value > 0)
      .map((l) => ({
        source: l.source,
        target: l.target,
        value: l.value,
      }));

    if (sankeyLinks.length === 0) return null;

    const generator = sankey<NodeDatum, { source: string; target: string; value: number }>()
      .nodeId((d) => d.id)
      .nodeAlign(sankeyLeft)
      .nodeWidth(28)
      .nodePadding(12)
      .extent([
        [12, 16],
        [width - 12, height - 16],
      ]);

    return generator({
      nodes: sankeyNodes,
      links: sankeyLinks,
    });
  }, [data, width, height]);

  if (!layout) {
    return (
      <View style={[styles.container, { width, height }]}>
        <Svg width={width} height={height}>
          <SvgText x={width / 2} y={height / 2} textAnchor="middle" fill={Colors.textTertiary} fontSize={14}>
            Add income and expenses to see your money flow
          </SvgText>
        </Svg>
      </View>
    );
  }

  const linkPathGenerator = sankeyLinkHorizontal();

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        {/* Links */}
        {layout.links.map((link, i) => {
          const path = linkPathGenerator(link as any);
          const sourceNode = link.source as D3SankeyNode<NodeDatum, any>;
          return (
            <Path
              key={`link-${i}`}
              d={path ?? ""}
              fill="none"
              stroke={sourceNode.color ?? Colors.border}
              strokeOpacity={0.3}
              strokeWidth={Math.max((link as any).width ?? 1, 1)}
            />
          );
        })}
        {/* Nodes */}
        {layout.nodes.map((node, i) => {
          const n = node as D3SankeyNode<NodeDatum, any>;
          const x = n.x0 ?? 0;
          const y = n.y0 ?? 0;
          const w = (n.x1 ?? 0) - x;
          const h = (n.y1 ?? 0) - y;
          const cx = x + w / 2;
          const cy = y + h / 2;
          const showLabel = h >= 30;

          return (
            <React.Fragment key={`node-${i}`}>
              <Rect
                x={x}
                y={y}
                width={w}
                height={h}
                fill={n.color ?? Colors.primary}
                rx={4}
              />
              {showLabel && (
                <G transform={`translate(${cx}, ${cy}) rotate(-90)`}>
                  <SvgText
                    x={0}
                    y={0}
                    textAnchor="middle"
                    alignmentBaseline="central"
                    fill={Colors.white}
                    fontSize={10}
                    fontWeight="600"
                  >
                    {n.name.length > Math.floor(h / 6) ? n.name.slice(0, Math.floor(h / 6)) + "…" : n.name}
                  </SvgText>
                </G>
              )}
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: "hidden",
  },
});
