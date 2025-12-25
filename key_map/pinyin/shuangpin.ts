import { getValue } from "../../utils/obj.ts";
import { spilt_pinyin } from "./split_pinyin.ts";

export type ShuangpinMap = {
	sm: Record<string, string>; // 声母映射
	ym: Record<string, string>; // 韵母映射
	raw: Record<string, string>;
};

export const shuangpinMaps = {
	自然码: {
		sm: { zh: "v", ch: "i", sh: "u" },
		ym: {
			iu: "q",
			ia: "w",
			ua: "w",
			e: "e",
			uan: "r",
			ue: "t",
			ve: "t",
			ing: "y",
			uai: "y",
			u: "u",
			i: "i",
			o: "o",
			uo: "o",
			un: "p",
			a: "a",
			iong: "s",
			ong: "s",
			iang: "d",
			uang: "d",
			en: "f",
			eng: "g",
			ang: "h",
			an: "j",
			ao: "k",
			ai: "l",
			ei: "z",
			ie: "x",
			iao: "c",
			ui: "v",
			v: "v",
			ou: "b",
			in: "n",
			ian: "m",
		},
		raw: {
			a: "aa",
			ai: "ai",
			an: "an",
			ang: "ah",
			ao: "ao",
			e: "ee",
			ei: "ei",
			en: "en",
			eng: "eg",
			er: "er",
			o: "oo",
			ou: "ou",
		},
	},
} satisfies Record<string, ShuangpinMap>;

const cache = new Map<ShuangpinMap, Record<string, string>>();

export function generate_shuang_pinyin(
	pinyin_k_l: Array<string>,
	map: ShuangpinMap,
) {
	// biome-ignore lint/style/noNonNullAssertion: checked
	if (cache.has(map)) return cache.get(map)!;
	const { sm: sm_map, ym: ym_map, raw } = map;

	const dbp2fullp: Record<string, string> = {};

	for (const i of pinyin_k_l) {
		const r = getValue(raw, i);
		if (r) {
			dbp2fullp[r] = i;
			continue;
		}
		const [s, y] = spilt_pinyin(i);
		const ds = getValue(sm_map, s) ?? s;
		const dy = getValue(ym_map, y) ?? y;
		if ((ds + dy).length !== 2) continue;
		dbp2fullp[ds + dy] = i;
	}
	cache.set(map, dbp2fullp);
	return dbp2fullp;
}
