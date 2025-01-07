import React, { useEffect, useRef } from "react";

import * as echarts from "echarts";
import "./index.scss";

interface LineChartProps {
  data: any[];
}

const LineChart: React.FC<LineChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    // 从数据中提取时间和延迟值
    const timeData = data.map((item) => item.time);
    const originalDelayData = data.map((item) => item.original_delay);
    const optimizedDelayData = data.map((item) => item.optimized_delay);

    // 检查是否所有值都为0
    const allZero = [...originalDelayData, ...optimizedDelayData].every(
      (val) => val === 0
    );

    const option: echarts.EChartsOption = {
      title: {
        text: "加速趋势",
        textStyle: {
          color: "#fff",
          fontSize: 16,
        },
      },
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(0,0,0,0.7)",
        borderColor: "rgba(0,0,0,0.7)",
        textStyle: {
          color: "#fff",
        },
        renderMode: "html",
        formatter: function (params: any) {
          const dataIndex = params[0].dataIndex;
          const item = data[dataIndex];
          return `<div class="custom-tooltip">
            <div>时间：${item.time}</div>
            <div>网络类型：${item.network || "未知"}</div>
            <div>原始延迟：${item.original_delay}ms</div>
            <div>优化延迟：${item.optimized_delay}ms</div>
          </div>`;
        },
      },
      legend: {
        data: ["原始延迟", "优化延迟"],
        textStyle: {
          color: "#fff",
        },
        top: 0,
        left: 0,
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        top: "15%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: timeData,
        axisLine: {
          lineStyle: {
            color: "#F86C34",
          },
        },
        axisLabel: {
          color: "#fff",
        },
      },
      yAxis: {
        type: "value",
        name: "ms",
        splitLine: {
          lineStyle: {
            color: "#333",
          },
        },
        axisLine: {
          lineStyle: {
            color: "#F86C34",
          },
        },
        axisLabel: {
          color: "#fff",
        },
        max: allZero ? 40 : undefined,
        interval: allZero ? 20 : undefined,
      },
      series: [
        {
          name: "原始延迟",
          type: "line",
          data: originalDelayData,
          lineStyle: {
            color: "#F86C34",
            width: 2,
          },
          itemStyle: {
            color: "#F86C34",
          },
          showSymbol: false,
          emphasis: {
            scale: true,
            focus: "series",
            itemStyle: {
              borderWidth: 0,
            },
          },
        },
        {
          name: "优化延迟",
          type: "line",
          data: optimizedDelayData,
          lineStyle: {
            color: "#ff7a45",
            width: 4,
          },
          itemStyle: {
            color: "#ff7a45",
          },
          showSymbol: false,
          emphasis: {
            scale: true,
            focus: "series",
            itemStyle: {
              borderWidth: 0,
            },
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: "rgba(255, 122, 69, 0.3)",
              },
              {
                offset: 1,
                color: "rgba(255, 122, 69, 0)",
              },
            ]),
          },
        },
      ],
      // animation: true,
      // animationDuration: 1000,
      // animationDurationUpdate: 1000
    };

    chartInstance.current?.setOption(option);

    return () => {
      chartInstance.current?.dispose();
    };
  }, [data]);

  return <div ref={chartRef} className="speed-game-detailsline-chart" />;
};

export default LineChart;
