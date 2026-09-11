import type { SummaryJob } from "@/services/http/summary-jobs/types";
import { Loader } from "@/shared/components/loader";
import { Button } from "@/shared/components/ui/button";

export type ProjectSummaryPresentationProps = {
	job: SummaryJob | undefined;
	canRequest: boolean;
	isRequesting: boolean;
	onRequest: () => void;
};

const STATUS_LABEL: Record<SummaryJob["status"], string> = {
	pending: "待機中",
	processing: "処理中",
	completed: "完了",
	failed: "失敗",
};

/** 非同期ジョブの状態表示。ボタン → 待機中/処理中（ポーリング）→ 完了/失敗 */
export function ProjectSummaryPresentation({
	job,
	canRequest,
	isRequesting,
	onRequest,
}: ProjectSummaryPresentationProps) {
	const isRunning = job?.status === "pending" || job?.status === "processing";
	return (
		<div className="mt-2 flex flex-col gap-2 text-sm">
			<div className="flex items-center gap-2">
				<Button variant="outline" onClick={onRequest} disabled={!canRequest || isRequesting || isRunning}>
					AI 要約
				</Button>
				{job && (
					<span className="flex items-center gap-1 text-xs text-muted-foreground">
						{isRunning && <Loader className="size-3" />}
						{STATUS_LABEL[job.status]}
					</span>
				)}
			</div>
			{job?.status === "completed" && job.summary && (
				<p className="rounded-md bg-muted p-2 whitespace-pre-line">{job.summary}</p>
			)}
			{job?.status === "failed" && (
				<p className="text-xs text-destructive">{job.errorMessage ?? "要約に失敗しました"}</p>
			)}
		</div>
	);
}
