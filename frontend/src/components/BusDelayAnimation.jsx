import React, { useState, useEffect } from 'react';
import { Badge } from 'react-bootstrap';
import { Clock, AlertTriangle, CheckCircle, Navigation, MapPin } from 'lucide-react';

export const BusDelayAnimation = ({ compact = false }) => {
  const [phase, setPhase] = useState(0); // 0: on-time, 1: slight delay, 2: heavy delay

  useEffect(() => {
    const timer = setInterval(() => {
      setPhase((prev) => (prev + 1) % 3);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const delayStates = [
    {
      stop: 'Periyar Stand',
      scheduled: '08:30 AM',
      actual: '08:30 AM',
      delay: '+0 min',
      status: 'ON TIME',
      badgeVariant: 'success',
      icon: CheckCircle,
      traffic: 'Clear Flow',
      progress: '15%'
    },
    {
      stop: 'Goripalayam Junc',
      scheduled: '08:45 AM',
      actual: '08:52 AM',
      delay: '+7 min',
      status: 'SLIGHT DELAY',
      badgeVariant: 'warning',
      icon: AlertTriangle,
      traffic: 'Moderate Junc Traffic',
      progress: '52%'
    },
    {
      stop: 'Mattuthavani Terminus',
      scheduled: '09:05 AM',
      actual: '09:21 AM',
      delay: '+16 min',
      status: 'CONGESTION DELAY',
      badgeVariant: 'danger',
      icon: AlertTriangle,
      traffic: 'Peak Bottleneck Choke',
      progress: '90%'
    }
  ];

  const current = delayStates[phase];
  const StatusIcon = current.icon;

  return (
    <div className={`bus-delay-animator-box ${compact ? 'animator-compact' : ''}`}>
      {/* Header with Title and Live Ticker */}
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div className="d-flex align-items-center gap-1">
          <span className="pulse-beacon-sm"></span>
          <span className="animator-label text-uppercase fw-bold letter-spacing-1">
            Live Delay Tracker
          </span>
        </div>
        <Badge
          bg={current.badgeVariant}
          className={`anim-status-badge bg-opacity-15 text-${current.badgeVariant} border border-${current.badgeVariant} border-opacity-25 px-2 py-0`}
        >
          {current.delay} {current.status}
        </Badge>
      </div>

      {/* Miniature Road Track with Animated Bus */}
      <div className="transit-road-container">
        {/* Asphalt Road Lane */}
        <div className="transit-road-track">
          <div className="road-dashed-lines"></div>

          {/* 3 Stop Markers on Road */}
          <div className={`road-stop-marker stop-1 ${phase >= 0 ? 'reached' : ''}`} title="Periyar">
            <span className="stop-dot"></span>
            <span className="stop-tag">Periyar</span>
          </div>
          <div className={`road-stop-marker stop-2 ${phase >= 1 ? 'reached' : ''}`} title="Goripalayam">
            <span className="stop-dot choke-point"></span>
            <span className="stop-tag">Goripalayam</span>
          </div>
          <div className={`road-stop-marker stop-3 ${phase >= 2 ? 'reached' : ''}`} title="Mattuthavani">
            <span className="stop-dot"></span>
            <span className="stop-tag">Mattuthavani</span>
          </div>

          {/* Animated Bus Icon Moving along Track */}
          <div
            className={`transit-animated-bus bus-phase-${phase}`}
            style={{ left: current.progress }}
          >
            <div className="bus-svg-wrapper">
              <svg width="34" height="20" viewBox="0 0 34 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Bus Body */}
                <rect x="1" y="2" width="30" height="14" rx="3" fill="#1d4ed8" stroke="#ffffff" strokeWidth="1" />
                {/* Bus Roof / Route Indicator */}
                <rect x="5" y="0" width="16" height="3" rx="1" fill="#0284c7" />
                <text x="7" y="2.5" fill="#ffffff" fontSize="2.5" fontWeight="bold">77</text>
                {/* Windshield & Windows */}
                <rect x="23" y="4" width="7" height="6" rx="1" fill="#bae6fd" />
                <rect x="16" y="4" width="5" height="5" rx="1" fill="#bae6fd" />
                <rect x="9" y="4" width="5" height="5" rx="1" fill="#bae6fd" />
                <rect x="3" y="4" width="4" height="5" rx="1" fill="#bae6fd" />
                {/* Headlight beam */}
                <path d="M31 10 L34 8 L34 14 Z" fill="rgba(250, 204, 21, 0.75)" className="headlight-beam" />
                {/* Wheels */}
                <circle cx="7" cy="16" r="3" fill="#0f172a" stroke="#ffffff" strokeWidth="0.8" />
                <circle cx="24" cy="16" r="3" fill="#0f172a" stroke="#ffffff" strokeWidth="0.8" />
                <circle cx="7" cy="16" r="1.2" fill="#94a3b8" />
                <circle cx="24" cy="16" r="1.2" fill="#94a3b8" />
              </svg>
            </div>
            {/* Delay Float Bubble above Bus */}
            <div className={`bus-delay-bubble delay-bubble-${current.badgeVariant}`}>
              {current.delay}
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Grid: Scheduled vs Actual Arrival */}
      <div className="time-comparison-grid mt-2">
        <div className="time-cell">
          <span className="time-cell-label text-muted">Scheduled Timetable</span>
          <span className="time-cell-val text-dark">{current.scheduled}</span>
        </div>
        <div className="time-cell-arrow">&rarr;</div>
        <div className="time-cell">
          <span className="time-cell-label text-muted">Actual AVL Arrival</span>
          <span className={`time-cell-val text-${current.badgeVariant} fw-bold`}>
            {current.actual}
          </span>
        </div>
      </div>

      {/* Micro Status Footer */}
      <div className="d-flex align-items-center justify-content-between pt-1 text-muted micro-text">
        <span className="d-flex align-items-center gap-1">
          <MapPin size={11} className="text-primary" />
          <span>Stop: <strong>{current.stop}</strong></span>
        </span>
        <span className="d-flex align-items-center gap-1">
          <StatusIcon size={11} className={`text-${current.badgeVariant}`} />
          <span>{current.traffic}</span>
        </span>
      </div>
    </div>
  );
};

export default BusDelayAnimation;
