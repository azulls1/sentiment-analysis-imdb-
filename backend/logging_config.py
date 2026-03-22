"""
Structured logging configuration.

Uses JSON format in production (APP_ENV=production) for log aggregation
and human-readable format in development for easier debugging.
"""

import json
import logging
import os
import sys
from datetime import datetime, timezone


class JSONFormatter(logging.Formatter):
    """Formats log records as single-line JSON objects.

    Output fields: timestamp, level, logger, message, plus any extra
    fields attached to the LogRecord.
    """

    # Standard LogRecord attributes to exclude from 'extra'
    _RESERVED = frozenset({
        "name", "msg", "args", "created", "relativeCreated", "exc_info",
        "exc_text", "stack_info", "lineno", "funcName", "pathname",
        "filename", "module", "thread", "threadName", "process",
        "processName", "levelname", "levelno", "message", "msecs",
        "taskName",
    })

    def format(self, record: logging.LogRecord) -> str:
        log_entry: dict = {
            "timestamp": datetime.fromtimestamp(
                record.created, tz=timezone.utc
            ).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        # Attach any extra fields the caller added to the record
        for key, value in record.__dict__.items():
            if key not in self._RESERVED and not key.startswith("_"):
                log_entry[key] = value

        if record.exc_info and record.exc_info[0] is not None:
            log_entry["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_entry, default=str, ensure_ascii=False)


def setup_logging(level: str = "INFO") -> None:
    """Configure application logging.

    * **Production** (``APP_ENV=production``): JSON-formatted output for
      structured log aggregation (ELK, CloudWatch, Datadog, etc.).
    * **Development** (default): human-readable pipe-delimited output.
    """
    app_env = os.getenv("APP_ENV", "development").lower()

    if app_env == "production":
        formatter: logging.Formatter = JSONFormatter()
    else:
        formatter = logging.Formatter(
            fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    # Prevent duplicate handlers on repeated calls
    root_logger.handlers.clear()
    root_logger.setLevel(getattr(logging, level.upper(), logging.INFO))
    root_logger.addHandler(handler)

    # Reduce noise from third-party libraries
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
