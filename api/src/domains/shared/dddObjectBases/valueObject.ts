/**
 * 値オブジェクトの基底。
 *
 * - 生成時に必ず validate を通す。不正な値を持つインスタンスは存在しない
 * - 同一性は値で判定する（equals）。ID を持たない
 * - `_brand` はコンパイル時にだけ効く名義型。ProjectName と TenantName が同じ string でも取り違えられない
 *
 * 型引数: InputValueType（コンストラクタが受ける型）/ ValueObjectKey（ブランド）/ OutputValueType（validate 後に保持する型）
 */
export abstract class ValueObject<InputValueType, ValueObjectKey, OutputValueType = InputValueType> {
	protected readonly _value: OutputValueType;
	// ブランド型のためのプロパティ。実行時には設定しない
	private declare readonly _brand: ValueObjectKey;

	constructor(value: InputValueType) {
		this._value = this.validate(value);
	}

	get value(): OutputValueType {
		return this._value;
	}

	public equals(other: ValueObject<InputValueType, ValueObjectKey, OutputValueType>): boolean {
		return this.constructor === other.constructor && deepEqual(this._value, other._value);
	}

	protected abstract validate(value: InputValueType): OutputValueType;
}

const deepEqual = (a: unknown, b: unknown): boolean => {
	if (Object.is(a, b)) return true;
	if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
	if (Array.isArray(a) && Array.isArray(b)) {
		return a.length === b.length && a.every((v, i) => deepEqual(v, b[i]));
	}
	if (typeof a === "object" && typeof b === "object" && a !== null && b !== null) {
		const ka = Object.keys(a);
		const kb = Object.keys(b);
		return (
			ka.length === kb.length &&
			ka.every((k) => deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]))
		);
	}
	return false;
};
