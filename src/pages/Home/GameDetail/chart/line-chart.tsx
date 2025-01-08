import React, { useEffect, useRef } from "react";
import { formatTimestampToTime } from "@/common/utils";

import * as echarts from "echarts";
import "./index.scss";

interface LineChartProps {
  data: any[];
}

const LineChart: React.FC<LineChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const isFirstRender = useRef(true); // 是否初次渲染

  useEffect(() => {
    if (!data || data?.length === 0) return;
    if (!chartRef.current && chartInstance.current) return;

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
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(0,0,0,0.7)",
        borderColor: "rgba(255, 255, 255,0.2)",
        borderRadius: 6,
        renderMode: "html",
        axisPointer: {
          type: "line",
          snap: true,
        },
        confine: true,
        enterable: false, // 防止鼠标移入tooltip
        showDelay: 0, // 悬停0.5秒后显示tooltip
        hideDelay: 0, // 鼠标移出后快速隐藏
        formatter: function (params: any) {
          if (!Array.isArray(params) || params.length === 0) return "";
          const item = data[params[0].dataIndex];
          if (!item) return "";

          return `<div class="custom-tooltip">
            <div class="tooltip-time">时间：${formatTimestampToTime(
              item.time
            )}</div>
            <div class="tooltip-network">本地网络类型：${
              item.network || "未知"
            }</div>
            <div class="tooltip-original-delay">
              <div class="line"></div>
              <span>原始延迟：${item.original_delay}ms</span>
            </div>
            <div class="tooltip-optimized-delay">
              <div class="line"></div>
              <span>优化延迟：${item.optimized_delay}ms</span>
            </div>
          </div>`;
        },
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
            color: "rgba(255, 255, 255, 0.3)", // 改为淡白色
          },
        },
        axisLabel: {
          show: false, // 隐藏x轴标签
        },
        axisTick: {
          show: false, // 显示刻度线
        },
      },
      yAxis: {
        type: "value",
        axisLabel: {
          color: "#fff",
          formatter: "{value}ms", // 在刻度值后添加ms单位
        },
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
        max: allZero ? 40 : undefined,
        interval: allZero ? 20 : undefined,
      },
      series: [
        {
          name: "原始延迟",
          type: "line",
          data: originalDelayData,
          smooth: true, // 使用平滑曲线
          symbolSize: [8, 8], // 设置点的大小为0.8vw
          lineStyle: {
            color: "#F86C34",
            width: 2,
          },
          itemStyle: {
            color: "#fff", // 与线条颜色保持一致
            borderColor: "#fff",
            borderWidth: 0,
          },
          showSymbol: false,
          emphasis: {
            scale: false,
            focus: "series",
          },
        },
        {
          name: "优化延迟",
          type: "line",
          data: optimizedDelayData,
          smooth: true, // 使用平滑曲线
          symbolSize: [8, 8], // 设置点的大小为0.8vw
          lineStyle: {
            color: "#FFC57D",
            width: 4,
          },
          itemStyle: {
            color: "#fff",
          },
          showSymbol: false,
          emphasis: {
            scale: false,
            focus: "series",
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: "rgba(255, 197, 125, 0.3)",
              },
              {
                offset: 1,
                color: "rgba(255, 197, 125, 0)",
              },
            ]),
          },
        },
      ],
      animation: true,
      animationDuration: isFirstRender.current ? 1000 : 0, //第一次渲染时设置为1秒，之后设置为0
      animationDurationUpdate: 300, // 更新动画持续时间
      animationEasing: "cubicInOut", // 使用更平滑的动画曲线
      animationEasingUpdate: "cubicInOut",
    };

    chartInstance.current?.setOption(option);
    isFirstRender.current = false; // 第一次渲染完改为非第一次
    
    return () => {
      chartInstance.current?.dispose();
    };
  }, [data]);

  return <div ref={chartRef} className="speed-game-detailsline-chart" />;
};

export default LineChart;
