export const usersKeys = {
	all: ["users"] as const,
	getMe: () => ["users", "me"] as const,
};
