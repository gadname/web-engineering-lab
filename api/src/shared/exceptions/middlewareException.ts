import { ApplicationException, type ExceptionCategory } from "./applicationException";

/** ミドルウェア（認証・テナント認可）の失敗 */
export class MiddlewareException extends ApplicationException {
	public getCategory(): ExceptionCategory {
		return "system";
	}
}
