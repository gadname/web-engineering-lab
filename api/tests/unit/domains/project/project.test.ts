import { describe, expect, it } from "vitest";
import { Project } from "@/domains/project/project";
import { ProjectDescription } from "@/domains/project/valueObjects/projectDescription";
import { ProjectName } from "@/domains/project/valueObjects/projectName";
import { TenantId } from "@/domains/tenants/valueObjects/tenantId";
import { DomainException } from "@/shared/exceptions/domainException";
import { buildProject, TENANT_ID } from "@/tests/helpers/fixtures";

describe("Project", () => {
	describe("create", () => {
		it("新しい ID を採番し、未削除で生成する", () => {
			const project = Project.create({
				tenantId: new TenantId(TENANT_ID),
				name: new ProjectName("Alpha"),
				description: new ProjectDescription(null),
			});
			expect(project.id.value).toMatch(/^[0-9a-f-]{36}$/);
			expect(project.isDeleted()).toBe(false);
			expect(project.tenantId.value).toBe(TENANT_ID);
		});
	});

	describe("update", () => {
		it("指定した項目だけ変わった新しいインスタンスを返し、元は変わらない", () => {
			const original = buildProject({ name: "Alpha", description: "before" });
			const updated = original.update({ name: new ProjectName("Beta") });

			expect(updated).not.toBe(original);
			expect(updated.name.value).toBe("Beta");
			expect(updated.description.value).toBe("before");
			expect(original.name.value).toBe("Alpha");
			expect(updated.equals(original)).toBe(true); // 同じ ID なら同一の集約
		});

		it("削除済みは更新できない", () => {
			const deleted = buildProject({ deletedAt: new Date() });
			expect(() => deleted.update({ name: new ProjectName("Beta") })).toThrow(DomainException);
		});
	});

	describe("delete", () => {
		it("deletedAt が設定された新しいインスタンスを返す", () => {
			const now = new Date("2026-09-11T00:00:00Z");
			const deleted = buildProject().delete(now);
			expect(deleted.isDeleted()).toBe(true);
			expect(deleted.deletedAt).toEqual(now);
		});

		it("二重削除は ALREADY_DELETED", () => {
			const deleted = buildProject({ deletedAt: new Date() });
			try {
				deleted.delete();
				expect.unreachable();
			} catch (e) {
				expect((e as DomainException).errorCode).toBe("PROJECT.VALIDATION.ALREADY_DELETED");
			}
		});
	});
});
