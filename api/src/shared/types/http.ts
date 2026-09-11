import type { ObjectValueList } from "./utility";

export const SUCCESS_STATUS_CODE = {
	"200_OK": 200,
	"201_CREATED": 201,
	"204_NO_CONTENT": 204,
} as const;

export const CLIENT_ERROR_STATUS_CODE = {
	"400_BAD_REQUEST": 400,
	"401_UNAUTHORIZED": 401,
	"403_FORBIDDEN": 403,
	"404_NOT_FOUND": 404,
	"409_CONFLICT": 409,
	"422_UNPROCESSABLE_ENTITY": 422,
} as const;

export const SERVER_ERROR_STATUS_CODE = {
	"500_INTERNAL_SERVER_ERROR": 500,
	"503_SERVICE_UNAVAILABLE": 503,
} as const;

export const ERROR_STATUS_CODE = {
	...CLIENT_ERROR_STATUS_CODE,
	...SERVER_ERROR_STATUS_CODE,
} as const;

export type SuccessStatusCode = ObjectValueList<typeof SUCCESS_STATUS_CODE>;
export type ErrorStatusCode = ObjectValueList<typeof ERROR_STATUS_CODE>;
