import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ErrorBoundary from './components/ErrorBoundary';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import HomePage from './pages/HomePage';
import RoutesPage from './pages/RoutesPage';
import RouteDetailPage from './pages/RouteDetailPage';
import ComparePage from './pages/ComparePage';
import StopsPage from './pages/StopsPage';
import StopDetailPage from './pages/StopDetailPage';
import AnalyticsPage from './pages/AnalyticsPage';
import InsightsPage from './pages/InsightsPage';
import AboutPage from './pages/AboutPage';

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="landing" element={<LandingPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="home" element={<DashboardPage />} />
            <Route path="routes" element={<RoutesPage />} />
            <Route path="routes/:routeId" element={<RouteDetailPage />} />
            <Route path="compare" element={<ComparePage />} />
            <Route path="stops" element={<StopsPage />} />
            <Route path="stops/:stopId" element={<StopDetailPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="insights" element={<InsightsPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
