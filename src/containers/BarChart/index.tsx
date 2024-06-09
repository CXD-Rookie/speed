/*
 * @Author: zhangda
 * @Date: 2024-04-23 10:37:30
 * @LastEditors: zhangda
 * @LastEditTime: 2024-06-09 15:57:57
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\containers\BarChart\index.tsx
 */
import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

interface BarChartDataItem {
  timestamp: number;
  value: number;
}

interface BarChartProps {
  data: BarChartDataItem[];
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const myChart = echarts.init(chartRef.current);

    const options = {
      xAxis: {
        type: "category",
        // show: false,
        axisLine: { show: true }, // 显示 X 轴的轴线
        axisLabel: { show: false },
        axisTick: { show: false },
        data: data?.map((item) => item.timestamp),
      },
      yAxis: {
        axisTick: { show: true }, // 显示 Y 轴的刻度线
        axisLine: { show: true }, // 显示 Y 轴的轴线
        splitLine: { show: false }, // 隐藏 Y 轴的网格线
        type: "value",
        splitNumber: 3, // 只显示两个刻度值
        interval: "auto",
      },
      series: [
        {
          type: "bar",
          data: data?.map((item) => item.value),
          itemStyle: {
            color: "#F86C34", // 修改为蓝色
          },
          barWidth: "20%", // 设置柱子的宽度
          barGap: "30%", // 设置柱子之间的间距
          barCategoryGap: "20%", // 设置类别间距
        },
      ],
    };

    myChart.setOption(options);

    return () => {
      myChart.dispose();
    };
  }, [data]);

  return <div ref={chartRef} style={{ width: "65vw", height: "13.5vh" }} />;
};

export default BarChart;
