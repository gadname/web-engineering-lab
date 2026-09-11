import type { IAuthorizationRule, LogicalOperator } from "@/authorizers/shared/rules/interfaces";

/**
 * 認可ルールの合成（AND / OR）。
 * 「テナントに所属している かつ ADMIN または MEMBER」のような条件を、ルールの組み合わせとして宣言的に書く。
 * 短絡評価するので、重いルールは後ろに置く。
 */
export class AuthorizationRuleGroup implements IAuthorizationRule {
	private constructor(
		private readonly type: LogicalOperator,
		private readonly rules: readonly IAuthorizationRule[],
	) {
		if (rules.length === 0) throw new Error("Authorization rules cannot be empty");
	}

	static and(...rules: IAuthorizationRule[]): IAuthorizationRule {
		return new AuthorizationRuleGroup("AND", rules);
	}

	static or(...rules: IAuthorizationRule[]): IAuthorizationRule {
		return new AuthorizationRuleGroup("OR", rules);
	}

	async ok(): Promise<boolean> {
		if (this.type === "AND") {
			for (const rule of this.rules) if (!(await rule.ok())) return false;
			return true;
		}
		for (const rule of this.rules) if (await rule.ok()) return true;
		return false;
	}
}
