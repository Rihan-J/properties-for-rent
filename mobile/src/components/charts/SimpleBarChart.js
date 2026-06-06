/**
 * SimpleBarChart — lightweight SVG bar chart for admin stats.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { colors, fonts, fontSizes, spacing } from '../theme';

export default function SimpleBarChart({ data, height = 200, width = 300 }) {
  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map(d => d.value));
  const padding = 20;
  const chartHeight = height - padding * 2;
  const barWidth = (width - padding * 2) / data.length - 10;

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        {data.map((d, i) => {
          const barHeight = maxVal > 0 ? (d.value / maxVal) * chartHeight : 0;
          const x = padding + i * (barWidth + 10);
          const y = height - padding - barHeight;

          return (
            <React.Fragment key={d.label}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={colors.accent}
                rx={4}
              />
              <SvgText
                x={x + barWidth / 2}
                y={height - 5}
                fontSize={10}
                fill={colors.textSecondary}
                textAnchor="middle"
                fontFamily={fonts.medium}
              >
                {d.label}
              </SvgText>
              <SvgText
                x={x + barWidth / 2}
                y={y - 5}
                fontSize={12}
                fill={colors.text}
                textAnchor="middle"
                fontFamily={fonts.bold}
              >
                {d.value}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
});
