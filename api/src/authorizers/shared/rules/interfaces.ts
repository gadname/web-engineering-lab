export interface IAuthorizationRule {
	ok(): Promise<boolean>;
}

export type LogicalOperator = "AND" | "OR";
