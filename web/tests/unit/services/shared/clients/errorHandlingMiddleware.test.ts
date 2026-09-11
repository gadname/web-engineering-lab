import { describe, expect, it } from "vitest";
import { errorHandlingMiddleware } from "@/services/shared/clients/httpClient/middlewares/errorHandlingMiddleware";
import { FetchError } from "@/services/shared/exceptions/fetchError";
import { StructuredApiError } from "@/services/shared/exceptions/structuredApiError";

const call = (response: Response) =>
	// biome-ignore lint/suspicious/noExplicitAny: openapi-fetch の onResponse 引数のうち response だけを使う
	(errorHandlingMiddleware.onResponse as (args: any) => Promise<Response>)({ response });

describe("errorHandlingMiddleware", () => {
	it("2xx はそのまま通す", async () => {
		const res = Response.json({ ok: true }, { status: 200 });
		await expect(call(res)).resolves.toBe(res);
	});

	it("構造化エラーは StructuredApiError にする", async () => {
		const res = Response.json(
			{ statusCode: 404, errorCode: "PROJECT.ACCESS.NOT_FOUND", message: "見つかりません" },
			{ status: 404 }
		);
		const error = await call(res).catch((e: unknown) => e);
		expect(error).toBeInstanceOf(StructuredApiError);
		expect((error as StructuredApiError).errorCode).toBe("PROJECT.ACCESS.NOT_FOUND");
	});

	it("JSON でない失敗は FetchError にする", async () => {
		const res = new Response("<html>502</html>", { status: 502 });
		const error = await call(res).catch((e: unknown) => e);
		expect(error).toBeInstanceOf(FetchError);
	});
});
