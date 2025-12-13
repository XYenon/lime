from typing import List
from utils.split_pinyin import spilt_pinyin


class FuzzyConfig:
    def __init__(self):
        # 声母模糊音
        self.initial_fuzzy = {
            "c": "ch",
            "z": "zh",
            "s": "sh",
            # 'l': 'n',
            # 'n': 'l',
            # 'f': 'h',
            # 'h': 'f',
            # 'r': 'l',
            # 'l': 'r',
        }

        # 韵母模糊音
        self.final_fuzzy = {
            "an": "ang",
            "ang": "an",
            "en": "eng",
            "eng": "en",
            "in": "ing",
            "ing": "in",
            "ian": "iang",
            "iang": "ian",
            "uan": "uang",
            "uang": "uan",
        }

        # 是否启用模糊音
        self.enabled = True


# 创建全局模糊音配置实例
fuzzy_config = FuzzyConfig()


def generate_fuzzy_pinyin(pinyin: str) -> List[str]:
    """生成模糊音变体"""
    fuzzy_variants = set()

    if not fuzzy_config.enabled:
        return [pinyin]

    initial, final = spilt_pinyin(pinyin)

    for i in [initial] + (
        [fuzzy_config.initial_fuzzy[initial]]
        if initial in fuzzy_config.initial_fuzzy
        else []
    ):
        for j in [final] + (
            [fuzzy_config.final_fuzzy[final]]
            if final in fuzzy_config.final_fuzzy
            else []
        ):
            fuzzy_variants.add(i + j)

    return list(fuzzy_variants)
