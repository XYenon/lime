from typing import List, Tuple, TypedDict
from utils.all_pinyin import generate_pinyin
from utils.fuzzy_pinyin import generate_fuzzy_pinyin
from utils.shuangpin import generate_shuang_pinyin


class PinyinAndKey(TypedDict):
    py: str
    key: str
    preeditShow: str


# fmt:off
PinyinL = List[  # 拆分后的序列
    List[PinyinAndKey]  # 多选，比如模糊音，半个拼音等
]
# fmt:on

pinyin_k_l = sorted(
    list(filter(lambda x: len(x) > 1, generate_pinyin())),
    key=lambda x: len(x),
    reverse=True,
)

sp_map = generate_shuang_pinyin(pinyin_k_l)


# 按键转拼音
def keys_to_pinyin(keys: str, shuangpin=True) -> PinyinL:
    # 示例：将按键直接映射为拼音（实际可根据需求扩展）
    # 比如双拼、模糊
    l: PinyinL = []
    k = keys
    split_key = "'"
    if keys.startswith(split_key):
        return []
    if shuangpin != True:
        shuangpin_map = {}
    else:
        shuangpin_map = sp_map

    def try_match(k: str):
        has = False

        kl: List[Tuple[str, str]] = []
        for i in shuangpin_map:
            kl.append((i, shuangpin_map[i]))
        for i in pinyin_k_l:
            kl.append((i, i))

        for [i, pinyin] in kl:
            if k.startswith(i):
                has = True
                pinyin_variants = generate_fuzzy_pinyin(pinyin)
                py_list: List[PinyinAndKey] = []

                next = k[len(i) : len(i) + 1]
                if next == split_key:
                    i = i + split_key

                for variant in pinyin_variants:
                    py_list.append(PinyinAndKey(key=i, py=variant, preeditShow=variant))
                l.append(py_list)
                k = k[len(i) :]
                return k

        if has == False:
            return None

    count = 0
    while len(k) > 0:
        count = count + 1
        if count > len(keys) * 2:
            break

        if k.startswith(split_key):
            l.append([PinyinAndKey(py="*", key=split_key, preeditShow="*")])
            k = k[1:]

        nk = try_match(k)
        if nk != None:
            k = nk
        else:
            for plen in range(len(k)):
                xk = k[0 : plen + 1]
                nxk = xk
                ll: List[PinyinAndKey] = []
                for i in shuangpin_map.keys():
                    if i.startswith(xk):
                        py = shuangpin_map[i]

                        next = k[len(xk) : len(xk) + 1]
                        if next == split_key:
                            nxk = xk + split_key

                        ll.append(
                            PinyinAndKey(
                                key=nxk,
                                py=py,
                                preeditShow=(
                                    py[0:2] if py[0:2] in ["zh", "ch", "sh"] else py[0]
                                ),
                            )
                        )
                for i in pinyin_k_l:
                    if i.startswith(xk):
                        next = k[len(xk) : len(xk) + 1]
                        if next == split_key:
                            nxk = xk + split_key
                        ll.append(PinyinAndKey(key=nxk, py=i, preeditShow=xk))
                if ll:
                    l.append(ll)
                k = k[len(nxk) :]
                if ll:
                    break
    return l
