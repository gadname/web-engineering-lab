export interface IRequestMiddlewareStrategy {
	applyHeaders(request: Request): void;
}
