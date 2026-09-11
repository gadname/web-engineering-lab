import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import { health } from "@/routes/health";
import { swagger } from "@/routes/swagger";
import { protectedV1 } from "@/routes/v1/protected";
import { handleOnErrorMiddleware } from "@/shared/middlewares/handleOnErrorMiddleware";
import { requestContextMiddleware } from "@/shared/middlewares/requestContextMiddleware";
import { requestLogMiddleware } from "@/shared/middlewares/requestLogMiddleware";
import type { ApplicationEntry } from "@/shared/types/app";

/**
 * アプリの組み立て。
 *
 *   rootApp（ミドルウェア無し: /health）
 *     └─ apiApp（/api: requestId → requestContext → requestLog）
 *          ├─ /v1  … protectedV1（jwtAuth → users / tenants(tenantAuth)）
 *          ├─ /doc … OpenAPI JSON
 *          └─ /swagger
 *
 * ミドルウェアの順序には意味がある: requestId が無いと requestContext が作れず、
 * requestContext が無いとログに requestId が付かない。
 */
const rootApp = new OpenAPIHono<ApplicationEntry>();
rootApp.onError((err, c) => handleOnErrorMiddleware(err, c));
rootApp.route("/health", health);

const apiApp = new OpenAPIHono<ApplicationEntry>().basePath("/api");
apiApp.use(requestId());
apiApp.use(requestContextMiddleware);
// ブラウザ（web）からの呼び出しを許可する。認証ヘッダを送るため origin は "*" にできない
apiApp.use(
	cors({
		origin: ["http://localhost:3000"],
		allowHeaders: ["Authorization", "Content-Type", "X-Tenant-ID"],
		allowMethods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
		credentials: true,
	}),
);
apiApp.use(requestLogMiddleware);

apiApp.route("/v1", protectedV1);
apiApp.route("/swagger", swagger);

apiApp.doc("/doc", {
	openapi: "3.0.0",
	info: {
		version: "0.1.0",
		title: "taskboard API",
		description:
			"ローカルでは Authorize に userId を入れる（Bearer <userId>）。テナント系は X-Tenant-ID ヘッダ必須。",
	},
});
apiApp.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
	type: "http",
	scheme: "bearer",
	description: "ローカルでは userId をそのままトークンとして渡す",
});

rootApp.route("/", apiApp);

export const app = rootApp;
