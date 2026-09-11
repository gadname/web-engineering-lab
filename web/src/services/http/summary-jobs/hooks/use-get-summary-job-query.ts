import { useQuery } from "@tanstack/react-query";
import { getSummaryJob } from "@/services/http/summary-jobs/functions";
import { summaryJobsKeys } from "@/services/http/summary-jobs/keys";

const POLLING_INTERVAL_MS = 1500;

/**
 * ジョブの状態をポーリングで追う。
 * 終端状態（completed / failed）になったら refetchInterval を false にして止める。
 * 参考実装は WebSocket で進捗を受けるが、最小構成ではポーリングにしている。
 */
export const useGetSummaryJobQuery = (jobId: string | null) => {
	const { data, isLoading, error } = useQuery({
		queryKey: summaryJobsKeys.getSummaryJob(jobId ?? ""),
		queryFn: () => getSummaryJob(jobId as string),
		enabled: jobId !== null,
		// 既定では非表示タブでポーリングが止まる。ジョブの完了は別タブを見ている間にも起きるので続ける
		refetchIntervalInBackground: true,
		refetchInterval: (query) => {
			const status = query.state.data?.data?.status;
			return status === "completed" || status === "failed" ? false : POLLING_INTERVAL_MS;
		},
	});
	return { job: data?.data, isLoading, error };
};
