/**
 * テスト用の簡易 SSE リーダ。
 * 仕様準拠のパーサは演習 parser/（Todo 4〜5）で作る。ここでは「空行区切り・data: 行だけ」で十分。
 */
export type RawSse = { data: string[]; comments: string[] };

export const readAllSse = async (res: Response): Promise<RawSse> => {
	const text = await res.text();
	return splitSse(text);
};

export const splitSse = (text: string): RawSse => {
	const out: RawSse = { data: [], comments: [] };
	for (const block of text.split("\n\n")) {
		for (const line of block.split("\n")) {
			if (line.startsWith("data: ")) out.data.push(line.slice(6));
			else if (line.startsWith(":")) out.comments.push(line);
		}
	}
	return out;
};

/** ストリームを 1 イベントずつ読む（stop API のテスト用） */
export async function* iterateSse(res: Response): AsyncGenerator<string> {
	const reader = res.body?.getReader();
	if (!reader) throw new Error("no body");
	const decoder = new TextDecoder();
	let buffer = "";
	while (true) {
		const { done, value } = await reader.read();
		if (done) return;
		buffer += decoder.decode(value, { stream: true });
		const blocks = buffer.split("\n\n");
		buffer = blocks.pop() ?? "";
		for (const block of blocks) {
			const dataLine = block.split("\n").find((l) => l.startsWith("data: "));
			if (dataLine) yield dataLine.slice(6);
		}
	}
}
