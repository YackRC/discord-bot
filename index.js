// Require necessary Node.js and discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const {
	Client,
	Collection,
	Events,
	GatewayIntentBits,
	MessageFlags,
} = require('discord.js');

const { token } = require('./config');

// Create a new Discord client instance
const client = new Client({
	intents: [GatewayIntentBits.Guilds],
});

// Create a collection to store commands
client.commands = new Collection();

// Load commands from the commands directory
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);

	// Ignore files or unexpected entries directly inside commands/
	if (!fs.statSync(commandsPath).isDirectory()) {
		continue;
	}

	const commandFiles = fs
		.readdirSync(commandsPath)
		.filter((file) => file.endsWith('.js'));

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);

		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		}
		else {
			console.warn(
				`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
			);
		}
	}
}

// Run once when the client successfully connects
client.once(Events.ClientReady, (readyClient) => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Handle incoming slash commands
client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) {
		return;
	}

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(
			`No command matching /${interaction.commandName} was found.`,
		);
		return;
	}

	try {
		await command.execute(interaction);
	}
	catch (error) {
		console.error(
			`Error executing /${interaction.commandName}:`,
			error,
		);

		/*
		 * Discord error 10062 means the interaction is no longer valid.
		 *
		 * This usually happens when the interaction was not acknowledged
		 * quickly enough. Attempting to reply again would produce another
		 * Unknown Interaction error.
		 */
		if (error.code === 10062) {
			console.error(
				`Interaction for /${interaction.commandName} expired before it could be acknowledged.`,
			);
			return;
		}

		const errorMessage = {
			content: 'There was an error while executing this command!',
			flags: MessageFlags.Ephemeral,
		};

		/*
		 * Sending an error response can also fail. Keep it inside its own
		 * try/catch so that a failed reply does not crash the Node process.
		 */
		try {
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp(errorMessage);
			}
			else if (interaction.isRepliable()) {
				await interaction.reply(errorMessage);
			}
		}
		catch (replyError) {
			console.error(
				`Unable to send an error response for /${interaction.commandName}:`,
				replyError,
			);
		}
	}
});

// Log unexpected Promise failures
process.on('unhandledRejection', (reason) => {
	console.error('Unhandled Promise rejection:', reason);
});

// Log unexpected synchronous exceptions
process.on('uncaughtException', (error) => {
	console.error('Uncaught exception:', error);
});

// Log in to Discord with the bot token
client.login(token);
