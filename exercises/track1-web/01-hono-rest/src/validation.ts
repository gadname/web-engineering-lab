/**
 * 手書きのバリデーション。
 *
 * 02 で Zod に置き換える。ここでは「リクエストボディは信用できない入力である」ことと、
 * 検証失敗を 400 系のエラーとして表現する責務がルート側にあることを体感するのが目的。
 */
import type { CreateProjectInput, UpdateProjectInput } from "@/store";

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; errors: string[] };

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;

const isValidName = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0 && v.length <= 100;

const isValidDescription = (v: unknown): v is string | null | undefined =>
	v === undefined || v === null || typeof v === "string";

export const validateCreateProject = (body: unknown): ValidationResult<CreateProjectInput> => {
	if (!isRecord(body)) return { ok: false, errors: ["body must be an object"] };

	const errors: string[] = [];
	const { name, description } = body;
	if (!isValidName(name)) errors.push("name is required");
	if (!isValidDescription(description)) errors.push("description must be a string or null");
	if (errors.length > 0 || !isValidName(name) || !isValidDescription(description)) return { ok: false, errors };

	return { ok: true, value: { name, description: description ?? null } };
};

export const validateUpdateProject = (body: unknown): ValidationResult<UpdateProjectInput> => {
	if (!isRecord(body)) return { ok: false, errors: ["body must be an object"] };

	const errors: string[] = [];
	const { name, description } = body;
	if (name !== undefined && !isValidName(name)) errors.push("name must be a non-empty string <= 100 chars");
	if (!isValidDescription(description)) errors.push("description must be a string or null");
	if (name === undefined && description === undefined) errors.push("at least one field is required");
	if (errors.length > 0) return { ok: false, errors };

	const value: UpdateProjectInput = {};
	if (isValidName(name)) value.name = name;
	if (description !== undefined && isValidDescription(description)) value.description = description;
	return { ok: true, value };
};
