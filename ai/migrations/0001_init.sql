-- 要約ジョブ（集約の永続化先）。楽観ロック用に version を持つ
CREATE TABLE IF NOT EXISTS summary_jobs (
    id             UUID PRIMARY KEY,
    tenant_id      UUID NOT NULL,
    project_id     UUID NOT NULL,
    user_id        TEXT NOT NULL,
    status         TEXT NOT NULL,
    input_text     TEXT NOT NULL,
    summary        TEXT,
    error_message  TEXT,
    version        INTEGER NOT NULL DEFAULT 1,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS summary_jobs_tenant_id_created_at_idx ON summary_jobs (tenant_id, created_at DESC);

-- ジョブキュー（SQS の代替）。visible_at が過去の行だけが受信対象。
-- 受信時に visible_at を未来へずらす = SQS の visibility timeout。処理成功で行を削除する。
CREATE TABLE IF NOT EXISTS job_queue (
    id          BIGSERIAL PRIMARY KEY,
    job_type    TEXT NOT NULL,
    request_id  TEXT NOT NULL,
    body_data   JSONB NOT NULL,
    trace_id    TEXT,
    attempts    INTEGER NOT NULL DEFAULT 0,
    visible_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS job_queue_visible_at_idx ON job_queue (visible_at, id);
