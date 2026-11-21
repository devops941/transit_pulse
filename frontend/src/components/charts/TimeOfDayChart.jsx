import React from 'react';
import Plot from './PlotlyComponent';

export const TimeOfDayChart = ({ timeData = [] }) => {
  if (!timeData || timeData.length === 0) {
    return <div className="text-center py-4 text-muted small">No diurnal data available</div>;
  }

  const periods = timeData.map((t) => t.time_period_label || t.time_period);
  const avgDelays = timeData.map((t) => t.average_delay_minutes);

  // Peak delay highlighting
  const maxDelay = Math.max(...avgDelays);
  const colors = avgDelays.map((d) => (d === maxDelay ? '#DC2626' : '#0284C7'));

  const data = [
    {
      x: periods,
      y: avgDelays,
      type: 'bar',
      marker: {
        color: colors,
        line: { color: '#ffffff', width: 1.5 },
      },
      text: avgDelays.map((d) => `+${d}m`),
      textposition: 'auto',
    },
  ];

  const layout = {
    autosize: true,
    height: 300,
    margin: { l: 50, r: 20, t: 20, b: 60 },
    paper_bgcolor: 'transparent',
    plot_bgcolor: '#f8fafc',
    xaxis: {
      tickfont: { size: 11, color: '#475569' },
      gridcolor: '#e2e8f0',
    },
    yaxis: {
      title: 'Average Arrival Delay (Min)',
      titlefont: { size: 11, color: '#475569' },
      tickfont: { size: 10, color: '#475569' },
      gridcolor: '#e2e8f0',
    },
  };

  const config = {
    responsive: true,
    displayModeBar: false,
    displaylogo: false,
  };

  return <Plot data={data} layout={layout} config={config} useResizeHandler style={{ width: '100%', height: '300px' }} />;
};

export default TimeOfDayChart;
