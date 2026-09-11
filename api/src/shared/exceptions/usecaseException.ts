import { ApplicationException, type ExceptionCategory } from "./applicationException";

/** ユースケース層（存在確認・認可・Guard）の失敗 */
export class UsecaseException extends ApplicationException {
	public getCategory(): ExceptionCategory {
		return this.errorCode.startsWith("SYSTEM.") ? "system" : "domains";
	}
}
