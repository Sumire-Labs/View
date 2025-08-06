import './lib/setup';

import { LogLevel, SapphireClient } from '@sapphire/framework';
import { GatewayIntentBits } from 'discord.js';
import '@sapphire/plugin-i18next/register';
import type { InternationalizationContext } from '@sapphire/plugin-i18next';
import { join } from 'path';
import { readFileSync } from 'fs';
import { initializeDatabase } from './lib/database'; // パスを実際の場所に合わせてください

const main = async () => {
	let client: SapphireClient | null = null;
	try {
		// 1. データベースを初期化し、単一の接続オブジェクトを取得します
		const db = initializeDatabase();

		// 2. 取得した接続オブジェクトを使って、SQLステートメントを準備します
		const getGuildLanguageQuery = readFileSync('sql/getLanguageSetting.sql', 'utf8');
		const getGuildLanguageStatement = db.prepare(getGuildLanguageQuery);

		// 3. クライアントを作成します
		client = new SapphireClient({
			defaultPrefix: '!',
			caseInsensitiveCommands: true,
			logger: {
				level: LogLevel.Debug
			},
			intents: [GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent],
			loadMessageCommandListeners: true,
			i18n: {
				defaultName: 'ja',
				defaultMissingKey: 'key_missing',
				defaultNS: 'global',
				defaultLanguageDirectory: join(__dirname, '..', 'languages'),
				fetchLanguage: async (context: InternationalizationContext) => {
					if (context.guild) {
						const result = getGuildLanguageStatement.get(context.guild.id) as { language: string } | undefined;
						if (result) {
							return result.language;
						}
					}
					return 'ja';
				}
			}
		});

		client.logger.info('Logging in');
		await client.login();
		client.logger.info('logged in');
	} catch (error) {
		if (client) {
			client.logger.fatal(error);
			await client.destroy();
		} else {
			console.error('Fatal error during initialization:', error);
		}
		process.exit(1);
	}
};

void main();
