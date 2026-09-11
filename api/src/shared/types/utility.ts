export type ObjectValueList<T extends Record<never, never>> = T[keyof T];

// 名義型（同じ構造でも別物として扱いたいときに使う）
export type Brand<T, B> = T & { __brand: B };

// @hono/zod-openapi の defaultHook が受け取る検証結果
export type Result =
	| {
			success: true;
			data: object;
	  }
	| {
			success: false;
			error: import("zod").ZodError;
	  };
