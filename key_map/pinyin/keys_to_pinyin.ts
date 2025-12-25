import type { ZiIndAndKey, ZiIndL } from "../zi_ind.ts";
import { generate_pinyin } from "./all_pinyin.ts";
import {
	type FuzzyPinyinConfig,
	generate_fuzzy_pinyin,
} from "./fuzzy_pinyin.ts";
import {
	generate_shuang_pinyin,
	type ShuangpinMap,
	shuangpinMaps,
} from "./shuangpin.ts";

export type PinyinToKeyOptions = {
	shuangpin?: keyof typeof shuangpinMaps | false | ShuangpinMap;
	fuzzy?: FuzzyPinyinConfig;
};

const pinyin_k_l = generate_pinyin().toSorted((a, b) => b.length - a.length);

export function keys_to_pinyin(keys: string, op?: PinyinToKeyOptions): ZiIndL {
	const l: ZiIndL = [];
	let k = keys;
	const split_key = "'";
	if (keys.startsWith(split_key)) return [];
	const shuangpinMap = op?.shuangpin
		? generate_shuang_pinyin(
				pinyin_k_l,
				typeof op.shuangpin === "string"
					? shuangpinMaps[op.shuangpin]
					: op.shuangpin,
			)
		: {};

	function tryMatch(k: string) {
		const kl: { i: string; pinyin: string }[] = [];
		for (const i in shuangpinMap) {
			kl.push({ i, pinyin: shuangpinMap[i] });
		}
		for (const i of pinyin_k_l) {
			kl.push({ i, pinyin: i });
		}
		for (const { i, pinyin } of kl) {
			if (k.startsWith(i)) {
				const pinyin_variants = generate_fuzzy_pinyin(pinyin, op?.fuzzy);

				let ni = i;
				const next = k.at(i.length);
				if (next === split_key) {
					ni = i + split_key;
				}

				l.push(
					pinyin_variants.map((py) => ({
						ind: py,
						key: ni,
						preeditShow: py,
					})),
				);
				k = k.slice(ni.length);
				if (["a", "e", "o", "m", "n"].includes(i)) {
					return undefined; //即使我们添加了这个单字母拼音，但是还是让它匹配更长的拼音
				}
				return k;
			}
		}
		return undefined;
	}

	let _count = 0;
	while (k.length > 0) {
		_count++;
		if (_count > keys.length * 2) {
			console.error("keys_to_pinyin possible infinite loop:", {
				keys,
				op,
				l,
				k,
			});
			break;
		}

		if (k.startsWith(split_key)) {
			l.push([{ ind: "*", key: split_key, preeditShow: "*" }]);
			k = k.slice(1);
		}

		const nk = tryMatch(k);
		if (nk !== undefined) {
			k = nk;
		} else {
			for (let plen = 0; plen < k.length; plen++) {
				const xk = k.slice(0, plen + 1);
				let nxk = xk;
				const ll: ZiIndAndKey[] = [];
				for (const [i, py] of Object.entries(shuangpinMap)) {
					if (i.startsWith(xk)) {
						const next = k.at(xk.length);
						if (next === split_key) {
							nxk = xk + split_key;
						}
						ll.push({
							ind: py,
							key: nxk,
							preeditShow: ["zh", "ch", "sh"].includes(py.slice(0, 2))
								? py.slice(0, 2)
								: py[0],
						});
					}
				}
				for (const i of pinyin_k_l) {
					if (i.startsWith(xk)) {
						const next = k.at(xk.length);
						if (next === split_key) {
							nxk = xk + split_key;
						}
						ll.push({
							ind: i,
							key: nxk,
							preeditShow: xk,
						});
					}
				}
				k = k.slice(nxk.length);
				if (ll.length) {
					l.push(ll);
					break;
				}
			}
		}
	}
	return l;
}
