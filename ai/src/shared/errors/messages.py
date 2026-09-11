class MESSAGE_KEYS:  # noqa: N801
    class SUMMARY_JOB:  # noqa: N801
        NOT_FOUND = "summary_job.not_found"
        NOT_AUTHORIZED = "summary_job.not_authorized"
        TEXT_EMPTY = "summary_job.text_empty"
        TEXT_TOO_LONG = "summary_job.text_too_long"
        INVALID_TRANSITION = "summary_job.invalid_transition"

    class USER:  # noqa: N801
        NOT_AUTHENTICATED = "user.not_authenticated"

    class VALIDATION:  # noqa: N801
        REQUEST_INVALID = "validation.request_invalid"
        TENANT_HEADER_MISSING = "validation.tenant_header_missing"

    class SYSTEM:  # noqa: N801
        INTERNAL_ERROR = "system.internal_error"
        UNEXPECTED_ERROR = "system.unexpected_error"
        DATABASE_ERROR = "system.database_error"
        OPTIMISTIC_LOCK_CONFLICT = "system.optimistic_lock_conflict"
        EXTERNAL_SERVICE_ERROR = "system.external_service_error"
        CONFIG_NOT_INITIALIZED = "system.config_not_initialized"
        DOMAIN_RULE_VIOLATED = "system.domain_rule_violated"


MESSAGES: dict[str, str] = {
    "summary_job.not_found": "対象の要約ジョブが見つかりませんでした",
    "summary_job.not_authorized": "アクセス権限がありません",
    "summary_job.text_empty": "要約する文章を入力してください",
    "summary_job.text_too_long": "文章は {max} 文字以内にしてください",
    "summary_job.invalid_transition": "ジョブの状態 {current} からは {action} できません",
    "user.not_authenticated": "認証されていません。再度ログインしてください",
    "validation.request_invalid": "リクエストが不正です",
    "validation.tenant_header_missing": "テナントが指定されていません",
    "system.internal_error": "内部エラーが発生しました",
    "system.unexpected_error": "予期しないエラーが発生しました",
    "system.database_error": "データアクセスエラーが発生しました",
    "system.optimistic_lock_conflict": "他の処理と競合しました。再度お試しください",
    "system.external_service_error": "外部サービスエラーが発生しました",
    "system.config_not_initialized": "アプリケーションが初期化されていません",
    "system.domain_rule_violated": "内部エラーが発生しました",
}


def get_message(message_key: str, data: dict[str, object] | None = None) -> str:
    """文言を引き、{placeholder} を data の値で置換する."""
    if message_key not in MESSAGES:
        raise ValueError(f"Message not found for key: {message_key}")
    message = MESSAGES[message_key]
    for key, value in (data or {}).items():
        message = message.replace(f"{{{key}}}", str(value))
    return message
