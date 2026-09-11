"use client";

import { useState } from "react";
import { ProjectSummaryPresentation } from "@/components/projects/project-summary/presentation";
import { useGetSummaryJobQuery, usePostCreateSummaryJobMutation } from "@/services/http/summary-jobs";
import { useErrorHandler } from "@/services/shared/exceptions/use-error-handler";

type ProjectSummaryProps = {
	projectId: string;
	description: string | null;
};

/**
 * ai バックエンドに要約ジョブを投げ、完了までポーリングする。
 * 「作成（POST）」と「状態の取得（GET）」を分けているのは、処理が長くても HTTP 接続を握らないため。
 */
export function ProjectSummary({ projectId, description }: ProjectSummaryProps) {
	const [jobId, setJobId] = useState<string | null>(null);
	const { postCreateSummaryJobMutation } = usePostCreateSummaryJobMutation();
	const { job } = useGetSummaryJobQuery(jobId);
	const { handleError } = useErrorHandler();

	const onRequest = async () => {
		if (!description) return;
		try {
			const res = await postCreateSummaryJobMutation.mutateAsync({ projectId, text: description });
			setJobId(res.data?.id ?? null);
		} catch (error) {
			handleError(error, { fallbackTitle: "要約の依頼に失敗しました" });
		}
	};

	return (
		<ProjectSummaryPresentation
			job={job}
			canRequest={!!description}
			isRequesting={postCreateSummaryJobMutation.isPending}
			onRequest={onRequest}
		/>
	);
}
