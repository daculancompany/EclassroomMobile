// @ts-nocheck
import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import Svg, {G, Path, Text as SvgText} from 'react-native-svg';
import * as d3Shape from 'd3-shape';

const {width} = Dimensions.get('window');
const size = width - 100;
const radius = size / 2;
const innerRadius = radius - 20;

const score = 120;
const max = 150;
const remaining = max - score;

const data = [
  {label: 'Achieved', value: score, color: '#4CAF50'},
  {label: 'Remaining', value: remaining, color: '#e0e0e0'},
];

const pieData = d3Shape.pie().value(d => d.value)(data);
const arcGenerator = d3Shape.arc().outerRadius(radius).innerRadius(innerRadius);

const AttendanceDonutChart = () => {
  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <G x={size / 2} y={size / 2}>
          {pieData.map((slice, index) => {
            const path = arcGenerator(slice);
            const color = data[index].color;
            return <Path key={index} d={path} fill={color} />;
          })}

          {/* Center text */}
          <SvgText
            x={0}
            y={-5}
            fill="#333"
            fontSize="18"
            fontWeight="bold"
            textAnchor="middle">
            Attendance
          </SvgText>
          <SvgText
            x={0}
            y={18}
            fill="#4CAF50"
            fontSize="16"
            fontWeight="bold"
            textAnchor="middle">
            {`${score}/${max}`}
          </SvgText>
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
});

export default AttendanceDonutChart;
