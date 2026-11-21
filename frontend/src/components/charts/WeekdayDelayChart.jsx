import React from 'react';
import Plot from './PlotlyComponent';

export const WeekdayDelayChart = ({ weekdayData = [] }) => {
  if (!weekdayData || weekdayData.length === 0) {
    return <div className="text-center py-4 text-muted small">No weekday data available</div>;
  }

  const days = weekdayData.map((d) => d.day_of_week);
  const avgDelays = weekdayData.map((d) => d.average_delay_minutes);
  const onTimePcts = weekdayData.map((d) => d.on_time_percentage);

  const data = [
    {
      x: days,
      y: avgDelays,
      name: 'Average Delay (Min)',
      type: 'bar',
      marker: {
        color: '#0055A5',
        line: { color: '#003E7E', width: 1 },
      },
      yaxis: 'y1',
    },
    {
      x: days,
      y: onTimePcts,
      name: 'On-Time Rate (%)',
      type: 'scatter',
      mode: 'lines+markers',
      line: { color: '#16A34A', width: 3 },
      marker: { size: 8, color: '#16A34A' },
      yaxis: 'y2',
    },
  ];

  const layout = {
    autosize: true,
    height: 320,
    margin: { l: 50, r: 50, t: 30, b: 50 },
    paper_bgcolor: 'transparent',
    plot_bgcolor: '#f8fafc',
    legend: { orientation: 'h', y: 1.15, x: 0.1 },
    xaxis: {
      tickfont: { size: 11, color: '#475569' },
      gridcolor: '#e2e8f0',
    },
    yaxis: {
      title: 'Average Delay (Minutes)',
      titlefont: { size: 11, color: '#0055A5' },
      tickfont: { size: 10, color: '#0055A5' },
      gridcolor: '#e2e8f0',
    },
    yaxis2: {
      title: 'On-Time %',
      titlefont: { size: 11, color: '#16A34A' },
      tickfont: { size: 10, color: '#16A34A' },
      overlaying: 'y',
      side: 'right',
      range: [0, 100],
    },
  };

  const config = {
    responsive: true,
    displayModeBar: false,
    displaylogo: false,
  };

  return <Plot data={data} layout={layout} config={config} useResizeHandler style={{ width: '100%', height: '320px' }} />;
};

export default WeekdayDelayChart;
