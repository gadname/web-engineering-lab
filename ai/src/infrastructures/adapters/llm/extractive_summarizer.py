import asyncio
import re

from src.domains.summary_job.services.summarizer_protocol import SummarizerProtocol

_SENTENCE_SPLIT = re.compile(r"(?<=[。．.!?！？])\s*")


class ExtractiveSummarizer(SummarizerProtocol):
    """規則ベースの要約（先頭の数文を抜き出す）。LLM の API キーが無くても動く既定の実装.

    非同期処理の観察用に、意図的に少し待つ（web のポーリングで「処理中」が見える）。
    """

    def __init__(self, max_sentences: int = 2, simulated_latency_seconds: float = 2.0) -> None:
        self._max_sentences = max_sentences
        self._latency = simulated_latency_seconds

    async def summarize(self, text: str) -> str:
        await asyncio.sleep(self._latency)
        sentences = [s for s in _SENTENCE_SPLIT.split(text.strip()) if s]
        return "".join(sentences[: self._max_sentences]) or text.strip()[:100]
