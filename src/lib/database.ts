import { existsSync, readFileSync } from 'fs';
import Database from 'better-sqlite3';

export function initializeDatabase(): Database.Database {
	try {
		const dbPath = 'src/db.sqlite';

		// データベースファイルの存在確認
		if (!existsSync(dbPath)) {
			console.log('データベースファイルが見つかりません。新規作成します。');
		}

		// データベース接続を作成
		const db = new Database(dbPath);

		// データベース接続が正常か確認
		db.pragma('foreign_keys = ON');

		// 必要なテーブルの作成
		const createGuildLanguageTable = readFileSync('sql/createGuildLanguageTable.sql', 'utf8');
		db.exec(createGuildLanguageTable);

		console.log(`データベースの初期化が完了しました: ${dbPath}`);

		// 接続を閉じずに、そのまま返す
		return db;
	} catch (error) {
		console.error('データベースの初期化中にエラーが発生しました:', error);
		throw error;
	}
}
