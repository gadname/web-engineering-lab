import type { MessageKey } from "./messageKeys";

/**
 * ユーザー向け文言。
 *
 * 動的な値は `{name}` の形で書き、Exception の `data` で渡す。
 * 例: "{limit} 件まで作成できます。" + new UsecaseException(CODE, { data: { limit: 100 } })
 */
const ja: Record<MessageKey, string> = {
	"auth.authenticationFailed": "認証に失敗しました。",
	"auth.permissionDenied": "アクセス権限がありません。",
	"auth.tenantHeaderMissing": "テナントが指定されていません。",

	"business.project.notFound": "指定されたプロジェクトが見つかりません。",
	"business.project.nameEmpty": "プロジェクト名を入力してください。",
	"business.project.nameTooLong": "プロジェクト名は {max} 文字以内で入力してください。",
	"business.project.descriptionTooLong": "説明は {max} 文字以内で入力してください。",
	"business.project.duplicateName": "同じ名前のプロジェクトが既に存在します。",
	"business.project.countLimitExceeded": "プロジェクトは {limit} 件まで作成できます。",
	"business.project.alreadyDeleted": "このプロジェクトは既に削除されています。",
	"business.membership.notFound": "所属情報が見つかりません。",
	"business.membership.invalidRole": "不正なロールです。",
	"business.tenant.notFound": "指定されたテナントが見つかりません。",
	"business.tenant.nameEmpty": "テナント名を入力してください。",
	"business.tenant.nameTooLong": "テナント名は {max} 文字以内で入力してください。",
	"business.user.notFound": "指定されたユーザーが見つかりません。",
	"business.user.idEmpty": "ユーザー ID が空です。",
	"business.user.invalidEmail": "メールアドレスの形式が正しくありません。",

	"validation.invalidRequest": "リクエストの内容が正しくありません。",
	"validation.invalidUuid": "ID の形式が正しくありません。",

	"system.unexpected": "予期しないエラーが発生しました。",
	"system.configInvalid": "アプリケーション設定が不正です。",
	"system.configNotInitialized": "アプリケーション設定が初期化されていません。",
	"system.authStrategyNotImplemented": "この環境向けの認証方式は未実装です。",
	"system.transactionFailed": "処理中にエラーが発生しました。",
};

/**
 * メッセージキーから文言を組み立てる。`{key}` を data の値で置換する。
 * 置換できないプレースホルダは残さず空文字にする（"{max} 文字以内" が生で出るのを防ぐ）。
 */
export const getMessage = (key: MessageKey, data?: Record<string, unknown>): string => {
	const template = ja[key];
	return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, name: string) => {
		const value = data?.[name];
		return value === undefined || value === null ? "" : String(value);
	});
};
