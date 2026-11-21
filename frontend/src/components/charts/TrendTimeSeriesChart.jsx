import React from 'react';
import Plot from './PlotlyComponent';

export const TrendTimeSeriesChart = ({ trendData = [] }) => {
  if (!trendData || trendData.length === 0) {
    return <div className="text-center py-4 text-muted small">No time series trend data available</div>;
  }

  const dates = trendData.map((t) => t.date);
  const avgDelays = trendData.map((t) => t.average_delay_minutes);
  const medianDelays = trendData.map((t) => t.median_delay_minutes);

  const data = [
    {
      x: dates,
      y: avgDelays,
      name: 'Average Delay (Min)',
      type: 'scatter',
      mode: 'lines+markers',
      line: { color: '#0055A5', width: 2.5 },
      marker: { size: 6, color: '#0055A5' },
    },
    {
      x: dates,
      y: medianDelays,
      name: 'Median Delay (Min)',
      type: 'scatter',
      mode: 'lines',
      line: { color: '#0284C7', width: 2, dash: 'dot' },
    },
  ];

  const layout = {
    autosize: true,
    height: 320,
    margin: { l: 50, r: 20, t: 25, b: 60 },
    paper_bgcolor: 'transparent',
    plot_bgcolor: '#f8fafc',
    legend: { orientation: 'h', y: 1.15, x: 0.1 },
    xaxis: {
      title: 'Observation Date',
      titlefont: { size: 11, color: '#475569' },
      tickfont: { size: 10, color: '#475569' },
      gridcolor: '#e2e8f0',
    },
    yaxis: {
      title: 'Arrival Delay (Minutes)',
      titlefont: { size: 11, color: '#475569' },
      tickfont: { size: 10, color: '#475569' },
      gridcolor: '#e2e8f0',
    },
    shapes: [
      {
        type: 'line',
        xref: 'paper',
        x0: 0,
        x1: 1,
        y0: 5.0,
        y1: 5.0,
        line: {
          color: '#16A34A',
          width: 1.5,
          dash: 'dash',
        },
      },
    ],
    annotations: [
      {
        xref: 'paper',
        x: 0.98,
        y: 5.0,
        text: 'On-Time Limit (5 min)',
        showarrow: false,
        font: { size: 10, color: '#16A34A' },
        yanchor: 'bottom',
      },
    ],
  };

  const config = {
    responsive: true,
    displayModeBar: false,
    displaylogo: false,
  };

  return <Plot data={data} layout={layout} config={config} useResizeHandler style={{ width: '100%', height: '320px' }} />;
};

export default TrendTimeSeriesChart;
