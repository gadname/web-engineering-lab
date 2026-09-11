import { ApplicationException, type ExceptionCategory } from "./applicationException";

/** インフラ層（設定・DB・外部サービス）の失敗 */
export class InfrastructureException extends ApplicationException {
	public getCategory(): ExceptionCategory {
		return "system";
	}
}
