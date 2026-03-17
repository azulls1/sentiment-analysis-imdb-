from backend.data.model_results import DATASET_STATS, SAMPLE_REVIEWS


def get_dataset_stats() -> dict:
    return DATASET_STATS


def get_sample_reviews(limit: int = 8) -> list[dict]:
    return SAMPLE_REVIEWS[:limit]
