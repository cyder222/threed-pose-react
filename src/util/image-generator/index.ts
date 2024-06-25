export interface ImageGeneratorStrategy {
  generateImage(params: any): Promise<string>; // 画像URLなどを返す
}

class WebUIApiImageGenerator implements ImageGeneratorStrategy {
  generateImage(params: any): Promise<string> {
      return new Promise((resolve, reject) => {
    // 何かしらの非同期処理 (例: データベース問い合わせ、APIリクエスト)
    setTimeout(() => {
      if (/* 処理が成功 */) {
        resolve("取得したデータ"); // 成功時にresolveで解決
      } else {
        reject(new Error("エラーが発生しました")); // 失敗時にrejectで拒否
      }
    }, 1000); // 1秒後に結果を返す (あくまで例)
  });
  }
}