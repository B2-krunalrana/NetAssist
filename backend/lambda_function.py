"""Simple lambda-style handler for processing support ticket data.

This module is intentionally minimal so it can be swapped with a real
AWS/Azure/GCP lambda in the future. For now it just prints whatever
JSON payload it receives and returns a canned response.
"""

from typing import Any, Dict


def handler(event: Dict[str, Any]) -> Dict[str, Any]:
    """Process an incoming event (ticket form data).

    The function simply logs the contents of `event` to standard output
    so you can see it when running the local development server.
    """
    print("\n--- lambda_function.handler called ---")
    print(event)
    print("--- end of event ---\n")

    # In a real lambda you'd perform validation, insert into a database,
    # call other services, etc.  For now we just acknowledge receipt.
    return {"status": "received", "received": event}
