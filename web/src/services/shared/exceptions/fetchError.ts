/** 構造化エラーとして解釈できない失敗（通信断、非 JSON のゲートウェイ応答など） */
export class FetchError extends Error {
	public readonly response: Response;

	constructor(message: string, response: Response) {
		super(message);
		this.name = "FetchError";
		this.response = response;
	}
}
