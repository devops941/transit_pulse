import React from 'react';
import Plot from './PlotlyComponent';

export const DelayDistributionChart = ({ bins = [] }) => {
  if (!bins || bins.length === 0) {
    return <div className="text-center py-4 text-muted small">No distribution data available</div>;
  }

  const xLabels = bins.map((b) => b.bin_name);
  const yValues = bins.map((b) => b.percentage);
  const hoverText = bins.map((b) => `${b.count.toLocaleString()} trips (${b.percentage}%)`);

  // Assign distinct semantic colors
  const markerColors = bins.map((b) => {
    const name = b.bin_name.toLowerCase();
    if (name.includes('early')) return '#0284C7';      // Sky Blue
    if (name.includes('on-time')) return '#16A34A';    // Green
    if (name.includes('minor')) return '#EAB308';      // Yellow / Amber
    if (name.includes('moderate')) return '#F97316';   // Orange
    return '#DC2626';                                  // Red (Major & Severe)
  });

  const data = [
    {
      x: xLabels,
      y: yValues,
      text: hoverText,
      hoverinfo: 'x+text',
      type: 'bar',
      marker: {
        color: markerColors,
        line: { color: '#ffffff', width: 1.5 },
      },
    },
  ];

  const layout = {
    autosize: true,
    height: 320,
    margin: { l: 50, r: 20, t: 20, b: 60 },
    paper_bgcolor: 'transparent',
    plot_bgcolor: '#f8fafc',
    xaxis: {
      tickfont: { size: 11, color: '#475569' },
      gridcolor: '#e2e8f0',
    },
    yaxis: {
      title: 'Percentage of Trips (%)',
      titlefont: { size: 12, color: '#475569' },
      tickfont: { size: 11, color: '#475569' },
      gridcolor: '#e2e8f0',
      zerolinecolor: '#cbd5e1',
    },
  };

  const config = {
    responsive: true,
    displayModeBar: false,
    displaylogo: false,
  };

  return <Plot data={data} layout={layout} config={config} useResizeHandler style={{ width: '100%', height: '320px' }} />;
};

export default DelayDistributionChart;
