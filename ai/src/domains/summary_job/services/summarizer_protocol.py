from typing import Protocol


class SummarizerProtocol(Protocol):
    """要約器の契約。LLM でも規則ベースでも同じ形で使う。ドメインは実装技術を知らない."""

    async def summarize(self, text: str) -> str: ...
