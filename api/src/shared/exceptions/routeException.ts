import { ApplicationException, type ExceptionCategory } from "./applicationException";

/** ルート層（リクエストの形の検証）の失敗 */
export class RouteException extends ApplicationException {
	public getCategory(): ExceptionCategory {
		return "validation";
	}
}
