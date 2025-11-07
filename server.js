const kv = await Deno.openKv();

//セット
await kv.set(['pokemon','イーブイ', 'ブラッキー'], { type: '悪', level: 35 });
await kv.set(['pokemon','イーブイ', 'シャワーズ'], { type: '水', level: 26 });

// 取得：prefix プロパティに上階層のキーを指定。→pokemon
const pkmns = await kv.list({ prefix: ['pokemon'] });

// レコードの削除：レコード（単体）の削除は delete メソッドを使う
await kv.delete(['pokemon', 'ブラッキー']);

//利用：定数pkmnsはfor await...of文の中でのみ使える。
for await (const pkmn of pkmns) {
  console.log(pkmn.key);   // → キー
  console.log(pkmn.value); // → 値
}

async function getNextId() {
  // pokemonコレクション用のカウンタのキー
  const key = ['counter', 'pokemon'];

  // アトミック処理の中でカウンターに1を足す
  //sum メソッドは、第 1 引数に指定されたキーのデータに、第 2 引数で指定された BigInt 型の値を足す。
  const res = await kv.atomic().sum(key, 1n).commit(); //sum(キー, BigInt型の値); // キーのデータ＋値

  // 確認：戻り値の ok プロパティが falsy な値だと失敗
  if (!res.ok) {
    console.error('IDの生成に失敗しました。');
    return null;
  }

  // カウンターをgetして…
  const counter = await kv.get(key);

  // Number型としてreturnする
  return Number(counter.value);
}

