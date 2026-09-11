from src.domains.summary_job.services.summarizer_protocol import SummarizerProtocol

from .extractive_summarizer import ExtractiveSummarizer


class SummarizerFactory:
    """要約器の選択を隠蔽する。LLM（OpenAI 等）実装を足すときはここで設定に応じて切り替える."""

    @staticmethod
    def create(summarizer: SummarizerProtocol | None = None) -> SummarizerProtocol:
        if summarizer is not None:
            return summarizer
        return ExtractiveSummarizer()
