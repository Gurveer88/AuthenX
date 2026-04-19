from __future__ import annotations
import logging
from langchain_core.tools import tool
from config import SERPAPI_KEY



logger = logging.getLogger(__name__)
_client = None
if SERPAPI_KEY:
    try:
        import serpapi  # type: ignore
        _client = serpapi.Client(api_key=SERPAPI_KEY)
        logger.info("SerpAPI client initialised.")
    except ImportError:
        logger.warning(
            "serpapi package not installed. Run `pip install serpapi` to enable web search."
        )


@tool
def web_search(query: str, num_results: int = 5) -> list[dict]:
    """Search the web for information using Google Search. Useful for retrieving real-time or factual data."""
    if _client is None:
        logger.info("SerpAPI not configured — returning stub results for: %s", query)
        return [
            {
                "title": f"[Stub] Search result for: {query}",
                "link": "https://example.com",
                "snippet": (
                    "SerpAPI is not configured. Set the SERPAPI_KEY environment "
                    "variable and install the `serpapi` package to enable real search."
                ),
            }
        ]
    try:
        raw = _client.search(
            {
                "engine": "google",
                "q": query,
                "num": num_results,
            }
        )
        results = []
        for item in raw.get("organic_results", [])[:num_results]:
            results.append(
                {
                    "title": item.get("title", ""),
                    "link": item.get("link", ""),
                    "snippet": item.get("snippet", ""),
                }
            )
        return results
    except Exception as exc:
        logger.error("SerpAPI search failed: %s", exc)
        return [
            {
                "title": f"[Error] Search failed for: {query}",
                "link": "",
                "snippet": str(exc),
            }
        ]