"""
Database wrapper for agent nodes.

Wraps each step to insert loading and completion rows into the database.
"""

from typing import Dict, Callable
from functools import wraps
from src.utils.db import insert_step_loading, insert_step_output, get_step_metadata


AGENT_VERSION = "1.0.0"
MODEL_VERSION = "llama-3.3-70b"


def with_db_logging(step_name: str, step_index: int):
    """
    Decorator that wraps a node function to log to database.

    Args:
        step_name: Name of the step (e.g., "step_1_analyze_rules")
        step_index: Step number (1-12)
    """
    def decorator(func: Callable):
        @wraps(func)
        def wrapper(state: Dict) -> Dict:
            # Get run_id and market_ticker from state
            run_id = state.get('run_id')
            market_ticker = state.get('market_ticker')

            if not run_id or not market_ticker:
                # If no run_id/ticker, just run the function without DB logging
                return func(state)

            # Get metadata for this step
            metadata = get_step_metadata(step_name, state)

            # Insert loading row
            try:
                insert_step_loading(
                    run_id=run_id,
                    step_index=step_index,
                    market_ticker=market_ticker,
                    step_kind=metadata.get('kind', 'UNKNOWN'),
                    headline=metadata.get('loading_headline', 'Processing...'),
                    agent_version=AGENT_VERSION,
                    model_version=MODEL_VERSION
                )
            except Exception as e:
                print(f"  WARNING: Failed to insert loading row: {e}")

            # Execute the actual step
            result = func(state)

            # Update state with result
            updated_state = {**state, **result}

            # Get headline, summary, direction from metadata functions
            try:
                headline = metadata.get('get_headline', lambda s: "Completed")(updated_state)
                summary = metadata.get('get_summary', lambda s: "Step completed successfully.")(updated_state)
                direction = metadata.get('get_direction', lambda s: None)(updated_state)

                # Build step output for database
                step_output = {
                    "step": step_index,
                    "step_name": step_name.replace("step_", "").replace("_", " ").title(),
                    **result  # Include all returned data
                }

                # Get confidence if this is the final step
                confidence = None
                if step_index == 12:  # Final step
                    # Could be based on delta_summary confidence or other factors
                    delta_conf = updated_state.get('delta_summary', {}).get('confidence', '')
                    if delta_conf == 'high':
                        confidence = 0.9
                    elif delta_conf == 'medium':
                        confidence = 0.7
                    elif delta_conf == 'low':
                        confidence = 0.4

                # Insert completion row
                insert_step_output(
                    run_id=run_id,
                    step_index=step_index,
                    market_ticker=market_ticker,
                    step_kind=metadata.get('kind', 'UNKNOWN'),
                    step_output=step_output,
                    headline=headline,
                    summary=summary,
                    direction=direction,
                    confidence=confidence,
                    agent_version=AGENT_VERSION,
                    model_version=MODEL_VERSION
                )
            except Exception as e:
                print(f"  WARNING: Failed to insert completion row: {e}")

            return result

        return wrapper
    return decorator
