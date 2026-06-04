/**
 * KANA_MAPPING - 完全版
 * 全ひらがな・カタカナ・濁音・半濁音・拗音・促音のローマ字入力パターンマッピング
 * 日本語タイピング練習サービス用の包括的なマッピングテーブル
 * 
 * バージョン: 2.0.0
 * 最終更新: 2026-01-30
 */

const KANA_MAPPING = {
    // ==========================================
    // 基本ひらがな (清音)
    // ==========================================
    // あ行
    'あ': ['a'], 
    'い': ['i', 'yi'], 
    'う': ['u', 'wu', 'whu'], 
    'え': ['e'], 
    'お': ['o'],

    // か行
    'か': ['ka', 'ca'], 
    'き': ['ki'], 
    'く': ['ku', 'cu', 'qu'], 
    'け': ['ke'], 
    'こ': ['ko', 'co'],

    // さ行
    'さ': ['sa'], 
    'し': ['shi', 'si', 'ci'], 
    'す': ['su'], 
    'せ': ['se', 'ce'], 
    'そ': ['so'],

    // た行
    'た': ['ta'], 
    'ち': ['chi', 'ti'], 
    'つ': ['tsu', 'tu'], 
    'て': ['te'], 
    'と': ['to'],

    // な行
    'な': ['na'], 
    'に': ['ni'], 
    'ぬ': ['nu'], 
    'ね': ['ne'], 
    'の': ['no'],

    // は行
    'は': ['ha'], 
    'ひ': ['hi'], 
    'ふ': ['fu', 'hu'], 
    'へ': ['he'], 
    'ほ': ['ho'],

    // ま行
    'ま': ['ma'], 
    'み': ['mi'], 
    'む': ['mu'], 
    'め': ['me'], 
    'も': ['mo'],

    // や行
    'や': ['ya'], 
    'ゆ': ['yu'], 
    'よ': ['yo'],

    // ら行
    'ら': ['ra'], 
    'り': ['ri'], 
    'る': ['ru'], 
    'れ': ['re'], 
    'ろ': ['ro'],

    // わ行
    'わ': ['wa'], 
    'ゐ': ['wi'], 
    'ゑ': ['we'], 
    'を': ['wo', 'o'], 
    'ん': ['nn', 'xn', 'n'], // 'n' は次の文字によって変わる特殊処理が必要

    // ==========================================
    // 濁音（がぎぐげご、ざじずぜぞ、だぢづでど、ばびぶべぼ）
    // ==========================================
    // が行
    'が': ['ga'], 
    'ぎ': ['gi'], 
    'ぐ': ['gu'], 
    'げ': ['ge'], 
    'ご': ['go'],

    // ざ行
    'ざ': ['za'], 
    'じ': ['ji', 'zi'], 
    'ず': ['zu'], 
    'ぜ': ['ze'], 
    'ぞ': ['zo'],

    // だ行
    'だ': ['da'], 
    'ぢ': ['ji', 'di'], 
    'づ': ['zu', 'du'], 
    'で': ['de'], 
    'ど': ['do'],

    // ば行
    'ば': ['ba'], 
    'び': ['bi'], 
    'ぶ': ['bu'], 
    'べ': ['be'], 
    'ぼ': ['bo'],

    // ==========================================
    // 半濁音（ぱぴぷぺぽ）
    // ==========================================
    'ぱ': ['pa'], 
    'ぴ': ['pi'], 
    'ぷ': ['pu'], 
    'ぺ': ['pe'], 
    'ぽ': ['po'],

    // ==========================================
    // 小書き仮名
    // ==========================================
    'ぁ': ['la', 'xa'], 
    'ぃ': ['li', 'xi', 'lyi', 'xyi'], 
    'ぅ': ['lu', 'xu'], 
    'ぇ': ['le', 'xe'], 
    'ぉ': ['lo', 'xo'],
    
    'ゃ': ['lya', 'xya'], 
    'ゅ': ['lyu', 'xyu'], 
    'ょ': ['lyo', 'xyo'],
    
    'ゎ': ['lwa', 'xwa'],
    
    // 促音（っ）- 次の子音の重複として扱うため特殊処理が必要
    'っ': ['ltu', 'xtu', 'ltsu'],

    // ==========================================
    // 拗音（きゃ、しゃ、ちゃ、にゃ、ひゃ、みゃ、りゃ）
    // ==========================================
    // きゃ行
    'きゃ': ['kya', 'kilya', 'kixya'], 
    'きゅ': ['kyu', 'kilyu', 'kixyu'], 
    'きょ': ['kyo', 'kilyo', 'kixyo'],

    // しゃ行
    'しゃ': ['sha', 'sya', 'silya', 'sixya', 'shilya', 'shixya'], 
    'しゅ': ['shu', 'syu', 'silyu', 'sixyu', 'shilyu', 'shixyu'], 
    'しょ': ['sho', 'syo', 'silyo', 'sixyo', 'shilyo', 'shixyo'],

    // ちゃ行
    'ちゃ': ['cha', 'tya', 'cya', 'tilya', 'tixya', 'chilya', 'chixya'], 
    'ちゅ': ['chu', 'tyu', 'cyu', 'tilyu', 'tixyu', 'chilyu', 'chixyu'], 
    'ちょ': ['cho', 'tyo', 'cyo', 'tilyo', 'tixyo', 'chilyo', 'chixyo'],

    // にゃ行
    'にゃ': ['nya', 'nilya', 'nixya'], 
    'にゅ': ['nyu', 'nilyu', 'nixyu'], 
    'にょ': ['nyo', 'nilyo', 'nixyo'],

    // ひゃ行
    'ひゃ': ['hya', 'hilya', 'hixya'], 
    'ひゅ': ['hyu', 'hilyu', 'hixyu'], 
    'ひょ': ['hyo', 'hilyo', 'hixyo'],

    // みゃ行
    'みゃ': ['mya', 'milya', 'mixya'], 
    'みゅ': ['myu', 'milyu', 'mixyu'], 
    'みょ': ['myo', 'milyo', 'mixyo'],

    // りゃ行
    'りゃ': ['rya', 'rilya', 'rixya'], 
    'りゅ': ['ryu', 'rilyu', 'rixyu'], 
    'りょ': ['ryo', 'rilyo', 'rixyo'],

    // ぎゃ行
    'ぎゃ': ['gya', 'gilya', 'gixya'], 
    'ぎゅ': ['gyu', 'gilyu', 'gixyu'], 
    'ぎょ': ['gyo', 'gilyo', 'gixyo'],

    // じゃ行
    'じゃ': ['ja', 'jya', 'zya', 'jilya', 'jixya', 'zilya', 'zixya'], 
    'じゅ': ['ju', 'jyu', 'zyu', 'jilyu', 'jixyu', 'zilyu', 'zixyu'], 
    'じょ': ['jo', 'jyo', 'zyo', 'jilyo', 'jixyo', 'zilyo', 'zixyo'],

    // ぢゃ行（現代では使用頻度低）
    'ぢゃ': ['dya', 'dilya', 'dixya'], 
    'ぢゅ': ['dyu', 'dilyu', 'dixyu'], 
    'ぢょ': ['dyo', 'dilyo', 'dixyo'],

    // びゃ行
    'びゃ': ['bya', 'bilya', 'bixya'], 
    'びゅ': ['byu', 'bilyu', 'bixyu'], 
    'びょ': ['byo', 'bilyo', 'bixyo'],

    // ぴゃ行
    'ぴゃ': ['pya', 'pilya', 'pixya'], 
    'ぴゅ': ['pyu', 'pilyu', 'pixyu'], 
    'ぴょ': ['pyo', 'pilyo', 'pixyo'],

    // ==========================================
    // カタカナ（基本清音）
    // ==========================================
    'ア': ['a'], 
    'イ': ['i', 'yi'], 
    'ウ': ['u', 'wu', 'whu'], 
    'エ': ['e'], 
    'オ': ['o'],
    'カ': ['ka', 'ca'], 
    'キ': ['ki'], 
    'ク': ['ku', 'cu', 'qu'], 
    'ケ': ['ke'], 
    'コ': ['ko', 'co'],
    'サ': ['sa'], 
    'シ': ['shi', 'si', 'ci'], 
    'ス': ['su'], 
    'セ': ['se', 'ce'], 
    'ソ': ['so'],
    'タ': ['ta'], 
    'チ': ['chi', 'ti'], 
    'ツ': ['tsu', 'tu'], 
    'テ': ['te'], 
    'ト': ['to'],
    'ナ': ['na'], 
    'ニ': ['ni'], 
    'ヌ': ['nu'], 
    'ネ': ['ne'], 
    'ノ': ['no'],
    'ハ': ['ha'], 
    'ヒ': ['hi'], 
    'フ': ['fu', 'hu'], 
    'ヘ': ['he'], 
    'ホ': ['ho'],
    'マ': ['ma'], 
    'ミ': ['mi'], 
    'ム': ['mu'], 
    'メ': ['me'], 
    'モ': ['mo'],
    'ヤ': ['ya'], 
    'ユ': ['yu'], 
    'ヨ': ['yo'],
    'ラ': ['ra'], 
    'リ': ['ri'], 
    'ル': ['ru'], 
    'レ': ['re'], 
    'ロ': ['ro'],
    'ワ': ['wa'], 
    'ヰ': ['wi'], 
    'ヱ': ['we'], 
    'ヲ': ['wo', 'o'], 
    'ン': ['nn', 'xn', 'n'],

    // カタカナ濁音
    'ガ': ['ga'], 
    'ギ': ['gi'], 
    'グ': ['gu'], 
    'ゲ': ['ge'], 
    'ゴ': ['go'],
    'ザ': ['za'], 
    'ジ': ['ji', 'zi'], 
    'ズ': ['zu'], 
    'ゼ': ['ze'], 
    'ゾ': ['zo'],
    'ダ': ['da'], 
    'ヂ': ['ji', 'di'], 
    'ヅ': ['zu', 'du'], 
    'デ': ['de'], 
    'ド': ['do'],
    'バ': ['ba'], 
    'ビ': ['bi'], 
    'ブ': ['bu'], 
    'ベ': ['be'], 
    'ボ': ['bo'],

    // カタカナ半濁音
    'パ': ['pa'], 
    'ピ': ['pi'], 
    'プ': ['pu'], 
    'ペ': ['pe'], 
    'ポ': ['po'],

    // カタカナ小書き
    'ァ': ['la', 'xa'], 
    'ィ': ['li', 'xi', 'lyi', 'xyi'], 
    'ゥ': ['lu', 'xu'], 
    'ェ': ['le', 'xe'], 
    'ォ': ['lo', 'xo'],
    'ッ': ['ltu', 'xtu', 'ltsu'],
    'ャ': ['lya', 'xya'], 
    'ュ': ['lyu', 'xyu'], 
    'ョ': ['lyo', 'xyo'],
    'ヮ': ['lwa', 'xwa'],

    // カタカナ拗音
    'キャ': ['kya', 'kilya', 'kixya'], 
    'キュ': ['kyu', 'kilyu', 'kixyu'], 
    'キョ': ['kyo', 'kilyo', 'kixyo'],
    'シャ': ['sha', 'sya', 'silya', 'sixya', 'shilya', 'shixya'], 
    'シュ': ['shu', 'syu', 'silyu', 'sixyu', 'shilyu', 'shixyu'], 
    'ショ': ['sho', 'syo', 'silyo', 'sixyo', 'shilyo', 'shixyo'],
    'チャ': ['cha', 'tya', 'cya', 'tilya', 'tixya', 'chilya', 'chixya'], 
    'チュ': ['chu', 'tyu', 'cyu', 'tilyu', 'tixyu', 'chilyu', 'chixyu'], 
    'チョ': ['cho', 'tyo', 'cyo', 'tilyo', 'tixyo', 'chilyo', 'chixyo'],
    'ニャ': ['nya', 'nilya', 'nixya'], 
    'ニュ': ['nyu', 'nilyu', 'nixyu'], 
    'ニョ': ['nyo', 'nilyo', 'nixyo'],
    'ヒャ': ['hya', 'hilya', 'hixya'], 
    'ヒュ': ['hyu', 'hilyu', 'hixyu'], 
    'ヒョ': ['hyo', 'hilyo', 'hixyo'],
    'ミャ': ['mya', 'milya', 'mixya'], 
    'ミュ': ['myu', 'milyu', 'mixyu'], 
    'ミョ': ['myo', 'milyo', 'mixyo'],
    'リャ': ['rya', 'rilya', 'rixya'], 
    'リュ': ['ryu', 'rilyu', 'rixyu'], 
    'リョ': ['ryo', 'rilyo', 'rixyo'],
    'ギャ': ['gya', 'gilya', 'gixya'], 
    'ギュ': ['gyu', 'gilyu', 'gixyu'], 
    'ギョ': ['gyo', 'gilyo', 'gixyo'],
    'ジャ': ['ja', 'jya', 'zya', 'jilya', 'jixya', 'zilya', 'zixya'], 
    'ジュ': ['ju', 'jyu', 'zyu', 'jilyu', 'jixyu', 'zilyu', 'zixyu'], 
    'ジョ': ['jo', 'jyo', 'zyo', 'jilyo', 'jixyo', 'zilyo', 'zixyo'],
    'ビャ': ['bya', 'bilya', 'bixya'], 
    'ビュ': ['byu', 'bilyu', 'bixyu'], 
    'ビョ': ['byo', 'bilyo', 'bixyo'],
    'ピャ': ['pya', 'pilya', 'pixya'], 
    'ピュ': ['pyu', 'pilyu', 'pixyu'], 
    'ピョ': ['pyo', 'pilyo', 'pixyo'],

    // ==========================================
    // 特殊文字・記号
    // ==========================================
    'ー': ['-'], 
    '、': [','], 
    '。': ['.'], 
    '！': ['!'], 
    '？': ['?'],
    '　': [' '], // 全角スペース
    ' ': [' '], // 半角スペース

    // ==========================================
    // 外来語対応（追加の特殊音）
    // ==========================================
    // うぁ行
    'うぁ': ['wha'], 
    'うぃ': ['whi', 'wi'], 
    'うぇ': ['whe', 'we'], 
    'うぉ': ['who'],

    // ゔ行
    'ゔ': ['vu'], 
    'ゔぁ': ['va'], 
    'ゔぃ': ['vi'], 
    'ゔぇ': ['ve'], 
    'ゔぉ': ['vo'],

    // てぃ・でぃ
    'てぃ': ['thi', 'texi'], 
    'てゅ': ['thu', 'texyu'], 
    'でぃ': ['dhi', 'dexi'], 
    'でゅ': ['dhu', 'dexyu'],

    // とぅ・どぅ
    'とぅ': ['twu', 'toxu'], 
    'どぅ': ['dwu', 'doxu'],

    // ふぁ行
    'ふぁ': ['fa', 'fuxa'], 
    'ふぃ': ['fi', 'fuxi', 'fyi'], 
    'ふぇ': ['fe', 'fuxe'], 
    'ふぉ': ['fo', 'fuxo'],

    // カタカナ版
    'ウァ': ['wha'], 
    'ウィ': ['whi', 'wi'], 
    'ウェ': ['whe', 'we'], 
    'ウォ': ['who'],
    'ヴ': ['vu'], 
    'ヴァ': ['va'], 
    'ヴィ': ['vi'], 
    'ヴェ': ['ve'], 
    'ヴォ': ['vo'],
    'ティ': ['thi', 'texi'], 
    'テュ': ['thu', 'texyu'], 
    'ディ': ['dhi', 'dexi'], 
    'デュ': ['dhu', 'dexyu'],
    'トゥ': ['twu', 'toxu'], 
    'ドゥ': ['dwu', 'doxu'],
    'ファ': ['fa', 'fuxa'], 
    'フィ': ['fi', 'fuxi', 'fyi'], 
    'フェ': ['fe', 'fuxe'], 
    'フォ': ['fo', 'fuxo'],

    // その他の外来語音
    'いぇ': ['ye', 'ixe'], 
    'イェ': ['ye', 'ixe'],
    
    'うぃ': ['whi', 'wi', 'uxi'], 
    'ウィ': ['whi', 'wi', 'uxi'],
    
    'くぁ': ['qwa', 'qa', 'kuxa'], 
    'くぃ': ['qwi', 'qi', 'kuxi'], 
    'くぇ': ['qwe', 'qe', 'kuxe'], 
    'くぉ': ['qwo', 'qo', 'kuxo'],
    
    'クァ': ['qwa', 'qa', 'kuxa'], 
    'クィ': ['qwi', 'qi', 'kuxi'], 
    'クェ': ['qwe', 'qe', 'kuxe'], 
    'クォ': ['qwo', 'qo', 'kuxo'],

    'つぁ': ['tsa', 'tuxa'], 
    'つぃ': ['tsi', 'tuxi'], 
    'つぇ': ['tse', 'tuxe'], 
    'つぉ': ['tso', 'tuxo'],

    'ツァ': ['tsa', 'tuxa'], 
    'ツィ': ['tsi', 'tuxi'], 
    'ツェ': ['tse', 'tuxe'], 
    'ツォ': ['tso', 'tuxo']
};

/**
 * 促音（っ）の処理用ヘルパー関数
 * 次の文字の子音を重複させる
 */
export function handleSokuon(nextKana) {
    if (!nextKana || !KANA_MAPPING[nextKana]) {
        return ['ltu', 'xtu', 'ltsu'];
    }
    
    const patterns = KANA_MAPPING[nextKana];
    const doubledPatterns = patterns.map(pattern => {
        // 最初の子音を取得して重複させる
        const firstConsonant = pattern[0];
        return firstConsonant + pattern;
    });
    
    return [...new Set([...doubledPatterns, 'ltu', 'xtu', 'ltsu'])];
}

/**
 * 「ん」の処理用ヘルパー関数
 * 次の文字によって 'n' だけでも可能かを判定
 */
export function handleN(nextKana) {
    if (!nextKana) {
        return ['nn', 'xn', 'n'];
    }
    
    const patterns = KANA_MAPPING[nextKana];
    if (!patterns || patterns.length === 0) {
        return ['nn', 'xn', 'n'];
    }
    
    // 次の文字が母音または 'y' で始まる場合、'n' だけでは不十分
    const firstChar = patterns[0][0];
    if (['a', 'i', 'u', 'e', 'o', 'y'].includes(firstChar)) {
        return ['nn', 'xn']; // 'n' を除外
    }
    
    return ['nn', 'xn', 'n'];
}

export { KANA_MAPPING };
