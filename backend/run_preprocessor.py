"""
TransitPulse - CLI Preprocessing Runner
Executes Phase 3 validation pipeline on the raw observation dataset.
"""
import sys
import os
import json

# Ensure project root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.services.data_preprocessor import DataPreprocessor

def main():
    print("=" * 60)
    print(" TransitPulse - Starting Data Validation & Preprocessing")
    print("=" * 60)
    
    preprocessor = DataPreprocessor()
    print(f"Loaded GTFS Registries:")
    print(f" - Routes: {len(preprocessor.valid_routes)}")
    print(f" - Stops: {len(preprocessor.valid_stops)}")
    print(f" - Trips: {len(preprocessor.valid_trips)}")
    print(f" - Stop-Time pairs: {len(preprocessor.valid_stop_times)}")
    
    print("\nExecuting validation pipeline across raw arrival observations...")
    metrics = preprocessor.run_pipeline()
    
    print("\n--- Pipeline Execution Summary ---")
    print(json.dumps(metrics, indent=2))
    print("\nValidation completed successfully.")

if __name__ == "__main__":
    main()
