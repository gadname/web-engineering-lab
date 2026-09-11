export const summaryJobsKeys = {
	all: ["summary-jobs"] as const,
	getSummaryJob: (jobId: string) => ["summary-jobs", "detail", jobId] as const,
};
