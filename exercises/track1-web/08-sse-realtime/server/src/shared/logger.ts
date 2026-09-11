/**
 * 最小の構造化ロガー。
 *
 * 本物（winston + OTel）は Track 1-05 / 3-04 で扱う。ここでは
 * 「ストリームの開始・完了・中断・失敗を 1 行ずつ残す」ために、sink を差し替えられる形だけ用意する。
 * テストは sink を配列に向けて、[SSE_START] などのタグが出たことを検証する。
 */
export type LogLevel = "info" | "warn" | "error";
export type LogLine = { level: LogLevel; message: string; meta?: Record<string, unknown> };
export type LogSink = (line: LogLine) => void;

let sink: LogSink = (line) => {
	const text = `${line.level.toUpperCase()} ${line.message}${line.meta ? ` ${JSON.stringify(line.meta)}` : ""}`;
	if (line.level === "error") console.error(text);
	else if (line.level === "warn") console.warn(text);
	else console.log(text);
};

export const Logger = {
	setSink(next: LogSink) {
		sink = next;
	},
	info(message: string, meta?: Record<string, unknown>) {
		sink({ level: "info", message, meta });
	},
	warn(message: string, meta?: Record<string, unknown>) {
		sink({ level: "warn", message, meta });
	},
	error(message: string, meta?: Record<string, unknown>) {
		sink({ level: "error", message, meta });
	},
};
