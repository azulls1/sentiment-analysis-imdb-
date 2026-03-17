"""
Celery configuration (DISABLED).

Redis/Celery was removed from docker-compose as it was unused at runtime.
This file is kept as a placeholder for future async task support.
To re-enable: add Redis to docker-compose.yml and uncomment below.
"""

# import os
# from celery import Celery
# from dotenv import load_dotenv
#
# load_dotenv()
#
# celery_app = Celery(
#     "sentiment_analysis",
#     broker=os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0"),
#     backend=os.getenv("REDIS_URL", "redis://localhost:6379/0"),
# )
