import { ApplicationException, type ExceptionCategory } from "./applicationException";

/** ドメイン層（集約・値オブジェクト）の不変条件違反 */
export class DomainException extends ApplicationException {
	public getCategory(): ExceptionCategory {
		return this.errorCode.startsWith("VALIDATION.") ? "validation" : "domains";
	}
}
