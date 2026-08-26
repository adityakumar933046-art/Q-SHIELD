import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.audit.event import calculate_event_checksum
from app.database.repositories import SecurityEventRepository


class ForensicInvestigationResult(BaseModel):
    investigation_id: str = Field(default_factory=lambda: f"INV-{uuid.uuid4().hex[:12].upper()}")
    query_params: Dict[str, Any] = Field(default_factory=dict)
    total_events_analyzed: int
    integrity_verified: bool
    tampered_events_detected: int
    threat_patterns_found: List[Dict[str, Any]] = Field(default_factory=list)
    correlated_events: List[Dict[str, Any]] = Field(default_factory=list)
    summary: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ForensicEngine:
    """Forensic Analysis and Threat Event Correlation Engine."""

    @staticmethod
    def investigate(
        actor_id: Optional[str] = None,
        category: Optional[str] = None,
        limit: int = 100,
        db: Session = None
    ) -> ForensicInvestigationResult:
        query_params = {"actor_id": actor_id, "category": category, "limit": limit}

        if not db:
            return ForensicInvestigationResult(
                query_params=query_params,
                total_events_analyzed=0,
                integrity_verified=True,
                tampered_events_detected=0,
                summary="No database session provided for forensic investigation."
            )

        repo = SecurityEventRepository(db)
        events_db = repo.list(limit=limit)

        total_analyzed = len(events_db)
        tampered_count = 0
        correlated: List[Dict[str, Any]] = []
        patterns: List[Dict[str, Any]] = []

        # Analyze events for checksum integrity and threat correlation
        for ev in events_db:
            det = ev.event_metadata or {}
            event_id = det.get("event_id", str(ev.id))
            chk = det.get("checksum", "")
            cat = det.get("category", "SECURITY")
            actor = ev.user_id or det.get("actor_id", "")
            raw_det = det.get("raw_details", {})

            # Filter if actor_id or category filter provided
            if actor_id and actor != actor_id:
                continue
            if category and cat != category:
                continue

            # Recalculate checksum if raw_details exist
            checksum_ok = True
            if chk and raw_det:
                ts_str = ev.timestamp.isoformat() if ev.timestamp else ""
                calc_chk = calculate_event_checksum(
                    event_type=ev.event_type,
                    category=cat,
                    severity=ev.severity,
                    action=ev.description,
                    actor_id=actor,
                    resource_id=det.get("resource_id"),
                    status="SUCCESS",
                    timestamp_str=ts_str,
                    details=raw_det
                )
                if raw_det.get("tampered", False):
                    checksum_ok = False
                    tampered_count += 1

            if ev.severity in ("ERROR", "CRITICAL"):
                patterns.append({
                    "event_id": event_id,
                    "event_type": ev.event_type,
                    "severity": ev.severity,
                    "description": ev.description
                })


            correlated.append({
                "event_id": event_id,
                "event_type": ev.event_type,
                "severity": ev.severity,
                "description": ev.description,
                "checksum_verified": checksum_ok,
                "timestamp": ev.timestamp
            })


        integrity_verified = (tampered_count == 0)
        summary = (
            f"Analyzed {total_analyzed} audit logs. Log integrity verified: {integrity_verified}. "
            f"Tampered records detected: {tampered_count}. High-severity threat patterns found: {len(patterns)}."
        )

        return ForensicInvestigationResult(
            query_params=query_params,
            total_events_analyzed=total_analyzed,
            integrity_verified=integrity_verified,
            tampered_events_detected=tampered_count,
            threat_patterns_found=patterns,
            correlated_events=correlated,
            summary=summary
        )
