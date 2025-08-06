import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { ApplicationCommandType, ApplicationIntegrationType, InteractionContextType, Message } from 'discord.js';
import { resolveKey } from '@sapphire/plugin-i18next';

@ApplyOptions<Command.Options>({
    description: 'ping pong'
})
export class UserCommand extends Command {
    // Register Chat Input and Context Menu command
    public override registerApplicationCommands(registry: Command.Registry) {
        const integrationTypes: ApplicationIntegrationType[] = [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall];
        const contexts: InteractionContextType[] = [
            InteractionContextType.BotDM,
            InteractionContextType.Guild,
            InteractionContextType.PrivateChannel
        ];

        registry.registerChatInputCommand({
            name: this.name,
            description: this.description,
            integrationTypes,
            contexts
        });

        registry.registerContextMenuCommand({
            name: this.name,
            type: ApplicationCommandType.Message,
            integrationTypes,
            contexts
        });

        registry.registerContextMenuCommand({
            name: this.name,
            type: ApplicationCommandType.User,
            integrationTypes,
            contexts
        });
    }

    public override async messageRun(message: Message) {
        return this.sendPing(message);
    }

    public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        return this.sendPing(interaction);
    }

    public override async contextMenuRun(interaction: Command.ContextMenuCommandInteraction) {
        return this.sendPing(interaction);
    }

    private async sendPing(interactionOrMessage: Message | Command.ChatInputCommandInteraction | Command.ContextMenuCommandInteraction) {
        const pingText = await resolveKey(interactionOrMessage, 'commands:ping.ping');
        
        const pingMessage =
            interactionOrMessage instanceof Message
                ? interactionOrMessage.channel?.isSendable() && (await interactionOrMessage.channel.send({ content: pingText }))
                : await interactionOrMessage.reply({ content: pingText, fetchReply: true });

        if (!pingMessage) return;

        const pongContent = await resolveKey(interactionOrMessage, 'commands:ping.pong', {
            botLatency: Math.round(this.container.client.ws.ping),
            apiLatency: pingMessage.createdTimestamp - interactionOrMessage.createdTimestamp
        });

        if (interactionOrMessage instanceof Message) {
            return pingMessage.edit({ content: pongContent });
        }

        return interactionOrMessage.editReply({
            content: pongContent
        });
    }
}
