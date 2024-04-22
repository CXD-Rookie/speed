import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

interface BarChartDataItem {
  label: string;
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
        show: false,
        data: data.map((item) => item.label),
      },
      yAxis: {
        show: false,
        type: "value",
      },
      series: [
        {
          type: "bar",
          data: data.map((item) => item.value),
          itemStyle: {
            // 柱子的颜色设置
            color: "#F86C34", // 修改为蓝色
          },
        },
      ],
    };

    myChart.setOption(options);

    return () => {
      myChart.dispose();
    };
  }, [data]);

  return <div ref={chartRef} style={{ width: "100%", height: "100px" }} />;
};

export default BarChart;
