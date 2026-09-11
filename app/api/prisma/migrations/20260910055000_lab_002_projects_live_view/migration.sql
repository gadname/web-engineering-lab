-- 論理削除されていない行だけを返す view。
-- Prisma は view の DDL を生成しないので、view を使うときは migration に手書きする。
-- 以後 projects のカラムを増やすときは、この view も更新する migration が必要になる（忘れると view から新カラムが見えない）。
CREATE VIEW "projects_live" AS
SELECT "id", "name", "description", "created_at", "updated_at"
FROM "projects"
WHERE "deleted_at" IS NULL;
