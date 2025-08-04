import './lib/setup';

import { LogLevel, SapphireClient } from '@sapphire/framework';
import { GatewayIntentBits } from 'discord.js';
import '@sapphire/plugin-i18next/register';
import type { InternationalizationContext } from '@sapphire/plugin-i18next';
import Database from 'better-sqlite3';
import { join } from 'path';

const db = new Database('src/db.sqlite');
const getGuildLanguageStatement = db.prepare('SELECT language FROM guild_language WHERE id = ?;');

const client = new SapphireClient({
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

const main = async () => {
	try {
		client.logger.info('Logging in');
		await client.login();
		client.logger.info('logged in');
	} catch (error) {
		client.logger.fatal(error);
		await client.destroy();
		process.exit(1);
	}
};

void main();
