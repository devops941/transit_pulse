import React from 'react';
import Plot from './PlotlyComponent';

export const RouteComparisonChart = ({ routes = [] }) => {
  if (!routes || routes.length === 0) {
    return <div className="text-center py-4 text-muted small">No comparison data available</div>;
  }

  const routeNames = routes.map((r) => `Route ${r.route_short_name}`);
  const avgDelays = routes.map((r) => r.average_delay_minutes);
  const onTimePcts = routes.map((r) => r.on_time_percentage);
  const reliabilityScores = routes.map((r) => r.reliability_score);

  const data = [
    {
      x: routeNames,
      y: avgDelays,
      name: 'Avg Delay (Min)',
      type: 'bar',
      marker: { color: '#EAB308' },
    },
    {
      x: routeNames,
      y: onTimePcts,
      name: 'On-Time Rate (%)',
      type: 'bar',
      marker: { color: '#16A34A' },
    },
    {
      x: routeNames,
      y: reliabilityScores,
      name: 'Reliability Score (0–100)',
      type: 'bar',
      marker: { color: '#0055A5' },
    },
  ];

  const layout = {
    barmode: 'group',
    autosize: true,
    height: 320,
    margin: { l: 50, r: 20, t: 30, b: 50 },
    paper_bgcolor: 'transparent',
    plot_bgcolor: '#f8fafc',
    legend: { orientation: 'h', y: 1.15, x: 0.05 },
    xaxis: {
      tickfont: { size: 12, color: '#0f172a' },
      gridcolor: '#e2e8f0',
    },
    yaxis: {
      title: 'Value',
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

  return <Plot data={data} layout={layout} config={config} useResizeHandler style={{ width: '100%', height: '320px' }} />;
};

export default RouteComparisonChart;
