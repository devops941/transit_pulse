"""
Reports API Endpoints
Provides structured JSON summaries and binary file downloads (PDF and Excel)
for route-specific and network-wide bus delay intelligence dossiers.
"""
import json
import os
from typing import Optional
from fastapi import APIRouter, Depends, Query, Response, HTTPException
from fastapi.responses import Response

from backend.app.schemas.common import ResponseEnvelope
from backend.app.analysis.delay_analyzer import DelayAnalyzer
from backend.app.api.deps import get_analyzer
from backend.app.services.pdf_report_generator import PDFReportGenerator
from backend.app.services.excel_report_generator import ExcelReportGenerator

router = APIRouter()

# Singletons for report compilation
_pdf_generator = PDFReportGenerator()
_excel_generator = ExcelReportGenerator()

def _load_quality_metadata() -> dict:
    """Loads dataset quality metadata if available on disk."""
    report_path = os.path.join(
        os.path.dirname(__file__),
        "..", "..", "..", "datasets", "processed", "data_quality_report.json"
    )
    if os.path.exists(report_path):
        try:
            with open(report_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}


@router.get("/reports/summary", response_model=ResponseEnvelope[dict])
def get_report_summary(
    route_id: Optional[str] = Query(None, description="Optional route filter for route report"),
    analyzer: DelayAnalyzer = Depends(get_analyzer)
):
    """Provides structured data summary suitable for generating downloadable reports."""
    if route_id:
        details = analyzer.get_route_details(route_id)
        if not details:
            return ResponseEnvelope(success=False, message=f"Route {route_id} not found", data=None)
        return ResponseEnvelope(
            success=True,
            message="Route report summary retrieved",
            data={
                "report_type": "ROUTE_PERFORMANCE_DOSSIER",
                "route_details": details
            }
        )
    else:
        overview = analyzer.calculate_summary_statistics(analyzer.df)
        route_ranks = analyzer.get_route_rankings()
        insights = analyzer.generate_public_insights()
        return ResponseEnvelope(
            success=True,
            message="System report summary retrieved",
            data={
                "report_type": "SYSTEM_NETWORK_SUMMARY",
                "overview": overview,
                "route_rankings": route_ranks,
                "insights": insights
            }
        )


@router.get("/reports/export/pdf")
def export_pdf_report(
    route_id: Optional[str] = Query(None, description="Optional Route ID for corridor dossier"),
    analyzer: DelayAnalyzer = Depends(get_analyzer)
):
    """
    Generates and streams a publication-quality PDF analytical dossier.
    Includes route KPIs, percentile distributions, stop bottlenecks, and temporal graphs.
    """
    quality_meta = _load_quality_metadata()

    if route_id:
        details = analyzer.get_route_details(route_id)
        if not details:
            raise HTTPException(status_code=404, detail=f"Corridor route '{route_id}' not found in active dataset.")
        
        pdf_bytes = _pdf_generator.generate_route_pdf(details, quality_data=quality_meta)
        filename = f"transitpulse_route_{route_id}_dossier.pdf"
    else:
        all_stops = analyzer.get_stop_analytics()
        overview = {
            "summary_statistics": analyzer.calculate_summary_statistics(analyzer.df),
            "total_routes_monitored": len(analyzer.get_route_rankings()),
            "total_stops_monitored": len(all_stops),
        }
        route_rankings = analyzer.get_route_rankings()
        sorted_stops = sorted(all_stops, key=lambda x: x.get("average_delay_minutes", 0), reverse=True)
        top_bottlenecks = sorted_stops[:10]
        weekday_data = analyzer.get_weekday_analytics()
        time_period_data = analyzer.get_time_period_analytics()
        insights = analyzer.generate_public_insights()

        pdf_bytes = _pdf_generator.generate_network_pdf(
            overview=overview,
            route_rankings=route_rankings,
            top_bottlenecks=top_bottlenecks,
            weekday_data=weekday_data,
            time_period_data=time_period_data,
            insights=insights,
            quality_data=quality_meta
        )
        filename = "transitpulse_metropolitan_network_dossier.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )


@router.get("/reports/export/excel")
def export_excel_report(
    route_id: Optional[str] = Query(None, description="Optional Route ID for corridor workbook"),
    analyzer: DelayAnalyzer = Depends(get_analyzer)
):
    """
    Generates and streams a multi-sheet analytical Excel (.xlsx) workbook.
    Includes executive summaries, route league tables, stop rankings, temporal breakdowns,
    and empirical telemetry observation samples.
    """
    quality_meta = _load_quality_metadata()

    if route_id:
        details = analyzer.get_route_details(route_id)
        if not details:
            raise HTTPException(status_code=404, detail=f"Corridor route '{route_id}' not found in active dataset.")
        
        excel_bytes = _excel_generator.generate_route_excel(
            route_details=details,
            raw_records_df=analyzer.df,
            quality_data=quality_meta
        )
        filename = f"transitpulse_route_{route_id}_data.xlsx"
    else:
        all_stops = analyzer.get_stop_analytics()
        overview = {
            "summary_statistics": analyzer.calculate_summary_statistics(analyzer.df),
            "total_routes_monitored": len(analyzer.get_route_rankings()),
            "total_stops_monitored": len(all_stops),
        }
        route_rankings = analyzer.get_route_rankings()
        stop_delays = sorted(all_stops, key=lambda x: x.get("average_delay_minutes", 0), reverse=True)
        weekday_data = analyzer.get_weekday_analytics()
        time_period_data = analyzer.get_time_period_analytics()

        excel_bytes = _excel_generator.generate_network_excel(
            overview=overview,
            route_rankings=route_rankings,
            stop_delays=stop_delays,
            weekday_data=weekday_data,
            time_period_data=time_period_data,
            raw_records_df=analyzer.df,
            quality_data=quality_meta
        )
        filename = "transitpulse_metropolitan_network_data.xlsx"

    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )
