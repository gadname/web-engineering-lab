/** @type {import('next').NextConfig} */
const nextConfig = {
	// 本番イメージでは standalone 出力を使う（node_modules 全体を持ち込まない）
	output: "standalone",
};

export default nextConfig;
