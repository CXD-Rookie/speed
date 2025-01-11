import React, { useEffect, useRef } from "react";
import { formatTimestampToTime } from "@/common/utils";

import * as echarts from "echarts";
import "./index.scss";

interface LineChartProps {
  data: any[];
}

const adapter: any = {
  unknown: "未知",
  ethernet: "有线",
  wireless: "无线",
};
const LineChart: React.FC<LineChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const isFirstRender = useRef(true); // 是否初次渲染
  const lastHoverIndex = useRef<number>(-1); // 记录上次hover的数据索引
  const mousePosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 }); // 记录鼠标位置

  useEffect(() => {
    if (!data || data?.length === 0) return;
    if (!chartRef.current && chartInstance.current) return;

    // 重新初始化实例
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
          label: {
            show: false,
          },
          lineStyle: {
            color: "#fff",
            width: 1,
          },
        },
        confine: true,
        enterable: false, // 防止鼠标移入tooltip
        showDelay: 0, // 悬停0.5秒后显示tooltip
        hideDelay: 0, // 鼠标移出后快速隐藏
        alwaysShowContent: false, // 确保tooltip不会一直显示
        position: function (
          pos: number[],
          params: any,
          dom: any,
          rect: any,
          size: any
        ) {
          // 使用记录的鼠标位置
          return [mousePosition.current.x + 10, mousePosition.current.y - 10];
        },
        formatter: function (params: any) {
          if (!Array.isArray(params) || params.length === 0) return "";
          // const item = data[params[0].dataIndex];
          const dataIndex = params[0].dataIndex;
          const item = data[dataIndex];

          if (!item) return "";

          // 更新最后hover的索引
          lastHoverIndex.current = dataIndex;

          const isDelay = item?.delay >= 9999; // 是否丢包

          // <div class="tooltip-original-delay">
          //     <div class="line"></div>
          //     <span style="color: ${isDelay ? "red" : "#fff"}">原始延迟：${
          //   isDelay ? "本地丢包" : item.original_delay + "ms"
          // }</span>
          //   </div>

          // 优化延迟line
          // <div class="line"></div>;
          return `<div class="custom-tooltip">
            <div class="tooltip-time">时间：${formatTimestampToTime(
              item.time
            )}</div>
            <div class="tooltip-network">本地网络类型：${
              adapter?.[item.network] || "未知"
            }</div>
            
            <div class="tooltip-optimized-delay">
              
              <span style="color: ${isDelay ? "red" : "#fff"}">延迟：${
            isDelay ? "本地丢包" : item.optimized_delay + "ms"
          }</span>
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
        // {
        //   name: "原始延迟",
        //   type: "line",
        //   data: originalDelayData,
        //   smooth: true, // 使用平滑曲线
        //   symbolSize: [8, 8], // 设置点的大小为0.8vw
        //   lineStyle: {
        //     color: "#F86C34",
        //     width: 2,
        //   },
        //   itemStyle: {
        //     color: "#fff", // 与线条颜色保持一致
        //     borderColor: "#fff",
        //     borderWidth: 0,
        //   },
        //   showSymbol: false,
        //   emphasis: {
        //     scale: false,
        //     focus: "series",
        //   },
        // },
        {
          name: "优化延迟",
          type: "line",
          data: optimizedDelayData,
          smooth: true, // 使用平滑曲线
          symbolSize: [8, 8], // 设置点的大小为0.8vw
          lineStyle: {
            color: "#F86C34",
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
                color: "rgba(248, 108, 52, 0.3)",
              },
              {
                offset: 1,
                color: "rgba(248, 108, 52, 0)",
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

    const chart = chartInstance.current;

    // 监听鼠标移动事件以更新位置
    chart?.getZr().on("mousemove", function (params: any) {
      mousePosition.current = {
        x: params.offsetX,
        y: params.offsetY,
      };

      // 如果当前有高亮的数据点，则更新tooltip位置
      if (lastHoverIndex.current !== -1) {
        chart.dispatchAction({
          type: "showTip",
          seriesIndex: 0,
          dataIndex: lastHoverIndex.current,
        });
      }
    });
    
    // 如果有上次hover的位置,更新数据后保持tooltip显示
    if (lastHoverIndex.current !== -1) {
      chartInstance.current?.dispatchAction({
        type: "showTip",
        seriesIndex: 0,
        dataIndex: lastHoverIndex.current,
      });
    }

    // 移除自动显示tooltip的逻辑
    chart?.on("globalout", function () {
      lastHoverIndex.current = -1;
    });

    return () => {
      chartInstance.current?.dispose();
    };
  }, [data]);

  return <div ref={chartRef} className="speed-game-detailsline-chart" />;
};

export default LineChart;
