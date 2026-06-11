/* ============================================================
   クレジットカード最適診断 — データ層
   cardDatabase(13種) + 5問の質問定義
   ※ スコアリング/アフィリエイトリンク/年齢制限ルールはここで定義
   ============================================================ */

/* 国際ブランドの簡易表記用 */
const BR = { visa:'VISA', mc:'Mastercard', jcb:'JCB', amex:'AMEX' };

const cardDatabase = {
  rakuten: {
    name:'楽天カード', issuer:'楽天カード株式会社',
    face:['#bf0000','#8e0000'], brandText:'Rakuten', brandClass:'rate-red',
    annualFee:'無料', annualFeeNum:0, baseRate:'1.0%',
    brands:['VISA','JCB','Mastercard','AMEX'],
    features:['年会費無料','高還元率'],
    desc:'圧倒的なポイント還元率で日常使いに最適な1枚',
    affiliate:{ type:'link', url:'https://www.rakuten-card.co.jp/' },
    scores:{ pointRate:9, lowFee:10, security:6, perks:6, netShopping:10, daily:8, travel:6, dining:7, transit:4, status:4, mile:5 },
    bonusUsage:'楽天市場でポイント高還元'
  },
  epos: {
    name:'エポスカード', issuer:'株式会社エポスカード',
    face:['#d4145a','#8e0c45'], brandText:'EPOS', brandClass:'rate-pink',
    annualFee:'無料', annualFeeNum:0, baseRate:'0.5%',
    brands:['VISA'],
    features:['年会費無料','優待が豊富'],
    desc:'全国10,000店舗の優待と即日発行が魅力',
    affiliate:{ type:'epos', url:'https://px.a8.net/svt/ejp?a8mat=457C4C+DEUKDU+38L8+BXQOH' },
    scores:{ pointRate:6, lowFee:10, security:7, perks:9, netShopping:6, daily:8, travel:7, dining:8, transit:6, status:5, mile:5 },
    bonusUsage:'マルイ・飲食店での優待が充実'
  },
  smbcNL: {
    name:'三井住友カード（NL）', issuer:'三井住友カード株式会社',
    face:['#0b5b3b','#06351f'], brandText:'VISA', brandClass:'sec-green',
    annualFee:'無料', annualFeeNum:0, baseRate:'0.5%〜',
    brands:['VISA','Mastercard'],
    features:['年会費無料','ナンバーレス'],
    desc:'安心のセキュリティと使いやすさ。対象のコンビニ・飲食店で高還元',
    affiliate:{ type:'link', url:'https://www.smbc-card.com/nyukai/card/numberless.jsp' },
    scores:{ pointRate:7, lowFee:9, security:10, perks:6, netShopping:6, daily:9, travel:6, dining:10, transit:6, status:6, mile:5 },
    bonusUsage:'対象店でスマホのタッチ決済で高還元'
  },
  jcbW: {
    name:'JCBカード W', issuer:'株式会社ジェーシービー',
    face:['#13284c','#0a182f'], brandText:'JCB', brandClass:'sec-navy',
    annualFee:'無料', annualFeeNum:0, baseRate:'1.0%〜',
    brands:['JCB'],
    features:['年会費無料','高還元率'],
    desc:'18〜39歳限定の高還元カード。Amazonやセブンでポイント優遇',
    affiliate:{ type:'link', url:'https://www.jcb.co.jp/ordercard/kojin_card/cardw.html' },
    ageLimit:[18,39],
    scores:{ pointRate:9, lowFee:10, security:8, perks:6, netShopping:9, daily:7, travel:6, dining:8, transit:5, status:5, mile:5 },
    bonusUsage:'Amazon・スターバックスでポイント優遇'
  },
  recruit: {
    name:'リクルートカード', issuer:'株式会社リクルート',
    face:['#1f3d7a','#13264d'], brandText:'VISA', brandClass:'sec-blue',
    annualFee:'無料', annualFeeNum:0, baseRate:'1.2%',
    brands:['VISA','JCB','Mastercard'],
    features:['年会費無料','基本還元1.2%'],
    desc:'基本還元率1.2%。どこで使ってもポイントが貯まりやすい',
    affiliate:{ type:'link', url:'https://recruit-card.jp/' },
    scores:{ pointRate:10, lowFee:10, security:6, perks:5, netShopping:8, daily:9, travel:6, dining:7, transit:5, status:4, mile:5 },
    bonusUsage:'じゃらん・ホットペッパーでさらにお得'
  },
  smbcGold: {
    name:'三井住友ゴールド（NL）', issuer:'三井住友カード株式会社',
    face:['#8a6d28','#5c4715'], brandText:'VISA', brandClass:'gold',
    annualFee:'5,500円', annualFeeNum:5500, baseRate:'0.5%〜',
    brands:['VISA','Mastercard'],
    features:['年100万円で永年無料','空港ラウンジ'],
    desc:'年間100万円利用で年会費永年無料＆ボーナスポイント',
    affiliate:{ type:'link', url:'https://www.smbc-card.com/nyukai/card/gold_numberless.jsp' },
    scores:{ pointRate:8, lowFee:6, security:10, perks:9, netShopping:6, daily:8, travel:9, dining:9, transit:6, status:9, mile:6 },
    bonusUsage:'年間100万円利用で10,000pボーナス'
  },
  paypay: {
    name:'PayPayカード', issuer:'PayPayカード株式会社',
    face:['#e8141e','#a50d14'], brandText:'PayPay', brandClass:'rate-red',
    annualFee:'無料', annualFeeNum:0, baseRate:'1.0%',
    brands:['VISA','JCB','Mastercard'],
    features:['年会費無料','PayPay連携'],
    desc:'PayPayとの相性抜群。ヤフーショッピングで高還元',
    affiliate:{ type:'link', url:'https://www.paypay-card.co.jp/' },
    scores:{ pointRate:8, lowFee:10, security:7, perks:6, netShopping:10, daily:8, travel:5, dining:7, transit:5, status:4, mile:4 },
    bonusUsage:'Yahoo!ショッピング・PayPay残高チャージ'
  },
  amazon: {
    name:'Amazon Mastercard', issuer:'三井住友カード株式会社',
    face:['#232f3e','#131a24'], brandText:'amazon', brandClass:'sec-navy',
    annualFee:'無料', annualFeeNum:0, baseRate:'1.0%〜',
    brands:['Mastercard'],
    features:['年会費無料','Amazonで2%'],
    desc:'Amazonユーザー必携。プライム会員なら2%還元',
    affiliate:{ type:'link', url:'https://www.amazon.co.jp/creditcard' },
    scores:{ pointRate:8, lowFee:10, security:8, perks:5, netShopping:10, daily:7, travel:5, dining:6, transit:4, status:4, mile:4 },
    bonusUsage:'Amazon・プライム会員で還元率アップ'
  },
  dcard: {
    name:'dカード', issuer:'株式会社NTTドコモ',
    face:['#cc0033','#8e0023'], brandText:'d', brandClass:'rate-red',
    annualFee:'無料', annualFeeNum:0, baseRate:'1.0%',
    brands:['VISA','Mastercard'],
    features:['年会費無料','dポイント'],
    desc:'ドコモユーザーに最適。dポイントが効率よく貯まる',
    affiliate:{ type:'link', url:'https://d-card.jp/' },
    scores:{ pointRate:8, lowFee:10, security:7, perks:7, netShopping:7, daily:9, travel:6, dining:7, transit:5, status:5, mile:4 },
    bonusUsage:'ドコモ料金・dポイント加盟店でお得'
  },
  aeon: {
    name:'イオンカードセレクト', issuer:'イオンフィナンシャルサービス',
    face:['#005baa','#003a6e'], brandText:'AEON', brandClass:'sec-blue',
    annualFee:'無料', annualFeeNum:0, baseRate:'0.5%',
    brands:['VISA','JCB','Mastercard'],
    features:['年会費無料','イオンで優待'],
    desc:'イオン系列での買い物がお得。お客さま感謝デーで5%OFF',
    affiliate:{ type:'link', url:'https://www.aeon.co.jp/' },
    scores:{ pointRate:6, lowFee:10, security:7, perks:8, netShopping:5, daily:10, travel:4, dining:6, transit:5, status:4, mile:3 },
    bonusUsage:'イオンでの買い物・WAON一体型'
  },
  viewSuica: {
    name:'ビュー・スイカカード', issuer:'株式会社ビューカード',
    face:['#0f7b3e','#0a4f28'], brandText:'VIEW', brandClass:'sec-green',
    annualFee:'524円', annualFeeNum:524, baseRate:'0.5%〜',
    brands:['VISA','JCB','Mastercard'],
    features:['Suica一体型','定期券対応'],
    desc:'通勤・通学に最適。Suicaチャージで還元率1.5%',
    affiliate:{ type:'link', url:'https://www.jreast.co.jp/card/' },
    scores:{ pointRate:6, lowFee:7, security:7, perks:6, netShopping:5, daily:7, travel:7, dining:5, transit:10, status:5, mile:5 },
    bonusUsage:'Suicaオートチャージ・定期券購入で高還元'
  },
  saison: {
    name:'セゾンカードインターナショナル', issuer:'株式会社クレディセゾン',
    face:['#2b2b2b','#101010'], brandText:'SAISON', brandClass:'sec-navy',
    annualFee:'無料', annualFeeNum:0, baseRate:'0.5%',
    brands:['VISA','JCB','Mastercard'],
    features:['年会費無料','即日発行'],
    desc:'有効期限のない永久不滅ポイント。最短即日発行に対応',
    affiliate:{ type:'link', url:'https://www.saisoncard.co.jp/' },
    scores:{ pointRate:5, lowFee:10, security:7, perks:7, netShopping:7, daily:7, travel:6, dining:6, transit:5, status:5, mile:5 },
    bonusUsage:'永久不滅ポイント・西友/リヴィンで優待'
  },
  olive: {
    name:'Olive フレキシブルペイ', issuer:'三井住友カード株式会社',
    face:['#1a1a2e','#0c0c1a'], brandText:'Olive', brandClass:'sec-navy',
    annualFee:'無料', annualFeeNum:0, baseRate:'0.5%〜',
    brands:['VISA'],
    features:['年会費無料','選べる特典'],
    desc:'1枚で4機能。選べる特典と最大還元でキャッシュレスを集約',
    affiliate:{ type:'link', url:'https://www.smbc.co.jp/kojin/olive/' },
    scores:{ pointRate:7, lowFee:9, security:10, perks:8, netShopping:6, daily:9, travel:6, dining:9, transit:6, status:7, mile:5 },
    bonusUsage:'対象店タッチ決済で最大還元・選べる特典'
  }
};

/* ===== 5問の質問定義 ===== */
const questions = [
  {
    id:'age', title:'あなたの年齢層を教えてください', label:'年齢層を選択', tooltip:'若いほどスペック高いカードを申し込める傾向。年代別限定カードもあります',
    sub:'年齢によって申し込めるカードが変わります', icon:'user', cols:2,
    options:[
      { label:'20代', sub:'18〜29歳', band:'20s', icon:'user' },
      { label:'30代', sub:'30〜39歳', band:'30s', icon:'user' },
      { label:'40代', sub:'40〜49歳', band:'40s', icon:'user' },
      { label:'50代以上', sub:'50歳〜', band:'50p', icon:'user' }
    ]
  },
  {
    id:'scene', title:'主にどんな場面で利用しますか？', label:'利用する場面', tooltip:'最も利用額が多いシーンを選ぶと、そのシーンで高還元のカードが見つかります',
    sub:'いちばん使うシーンを1つお選びください', icon:'cart', cols:1,
    options:[
      { label:'ネットショッピング中心', sub:'Amazon・楽天市場など', keys:['netShopping'], icon:'cart' },
      { label:'コンビニ・スーパーでの日常使い', sub:'毎日の買い物・公共料金', keys:['daily'], icon:'store' },
      { label:'旅行・出張が多い', sub:'交通・宿泊・海外利用', keys:['travel'], icon:'plane' },
      { label:'飲食・外食が多い', sub:'カフェ・レストラン', keys:['dining'], icon:'dining' },
      { label:'幅広くいろいろ使う', sub:'特定のシーンに偏らない', keys:['daily','netShopping','dining'], icon:'globe' }
    ]
  },
  {
    id:'amount', title:'月間のカード利用額はどのくらい？', label:'月間の利用額', tooltip:'利用額が多いほど、年会費の元を取れるゴールドカードがおすすめになります',
    sub:'おおよその目安で構いません', icon:'yen', cols:2,
    options:[
      { label:'3万円未満', sub:'ライトに利用', amt:'low', icon:'yen' },
      { label:'3万円〜5万円未満', sub:'標準的な利用', amt:'mid', icon:'yen' },
      { label:'5万円〜10万円未満', sub:'しっかり利用', amt:'high', icon:'yen' },
      { label:'10万円以上', sub:'ヘビーに利用', amt:'vhigh', icon:'yen' }
    ]
  },
  {
    id:'priority', title:'カード選びで最も重視するのは？', label:'重視するポイント', tooltip:'診断結果では、あなたの優先順位に合わせたカードが上位に表示されます',
    sub:'あなたの優先順位を教えてください', icon:'target', cols:1,
    options:[
      { label:'ポイント還元率', sub:'とにかくお得に貯めたい', keys:['pointRate'], icon:'percent' },
      { label:'年会費の安さ', sub:'コストをかけたくない', keys:['lowFee'], icon:'yen' },
      { label:'セキュリティ・安心感', sub:'不正利用が心配', keys:['security'], icon:'shield' },
      { label:'付帯特典・保険', sub:'旅行保険やラウンジなど', keys:['perks'], icon:'gift' },
      { label:'マイルが貯まる', sub:'飛行機によく乗る', keys:['mile','travel'], icon:'plane' }
    ]
  },
  {
    id:'lifestyle', title:'あなたのライフスタイルに近いのは？', label:'ライフスタイル', tooltip:'自分の生活スタイルを選ぶことで、日常で本当に得をするカードが見つかります',
    sub:'いちばん近いものをお選びください', icon:'heart', cols:1,
    options:[
      { label:'コスパ重視でお得に使いたい', sub:'年会費無料＆高還元が理想', keys:['lowFee','pointRate'], icon:'piggy' },
      { label:'とにかくシンプルに使いたい', sub:'1枚で安心して使いたい', keys:['security','lowFee'], icon:'check' },
      { label:'ステータス・特典を重視', sub:'ワンランク上のカードを', keys:['status','perks'], icon:'crown' },
      { label:'ネット通販をよく使う', sub:'オンライン中心の生活', keys:['netShopping'], icon:'cart' },
      { label:'旅行・出張をよくする', sub:'移動が多い暮らし', keys:['travel','mile'], icon:'plane' }
    ]
  }
];

const cardKeys = Object.keys(cardDatabase);
