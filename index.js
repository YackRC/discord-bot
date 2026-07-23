// Require necessary Node.js and discord.js classes
const fs = require('node:fs');
const path = require('node:path');

const cron = require('node-cron');

const {
	Client,
	Collection,
	Events,
	GatewayIntentBits,
	MessageFlags,
} = require('discord.js');

const {
	token,
	updateChannelId,
	updateTimezone,
} = require('./config');

const {
	checkAndPostUpdates,
} = require('./services/steam-updates');

// Create a Discord client
const client = new Client({
	intents: [GatewayIntentBits.Guilds],
});

// Store loaded slash commands
client.commands = new Collection();

/**
 * Load slash commands from commands/<category>/*.js
 */
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);

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
				`[WARNING] The command at ${filePath} is missing ` +
				'a required "data" or "execute" property.',
			);
		}
	}
}

/**
 * Run an update check without allowing an error to stop the bot.
 */
async function runUpdateCheck() {
	console.log(
		`[${new Date().toISOString()}] Checking for Marathon updates...`,
	);

	try {
		const postedCount = await checkAndPostUpdates(
			client,
			updateChannelId,
		);

		console.log(
			`Marathon update check complete. Posted ${postedCount} message(s).`,
		);
	}
	catch (error) {
		console.error(
			'Marathon update check failed:',
			error,
		);
	}
}

/**
 * Run once when Discord is ready.
 */
client.once(Events.ClientReady, async (readyClient) => {
	console.log(
		`Ready! Logged in as ${readyClient.user.tag}`,
	);

	/*
	 * Run once immediately after startup.
	 *
	 * On the first deployment, this posts every update returned by Steam.
	 * Later restarts will not repost stored GIDs.
	 */
	await runUpdateCheck();

	/*
	 * Cron format:
	 *
	 * second minute hour day-of-month month day-of-week
	 *
	 * Run at minute 0 during hours 12 through 20:
	 * 12 PM, 1 PM, 2 PM, ... 8 PM.
	 */
	cron.schedule(
		'0 0 12-20 * * *',
		runUpdateCheck,
		{
			timezone: updateTimezone,
			noOverlap: true,
			name: 'marathon-update-check',
		},
	);

	console.log(
		'Marathon update checker scheduled hourly from ' +
		`12 PM through 8 PM in ${updateTimezone}.`,
	);
});

/**
 * Handle slash commands.
 */
client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) {
		return;
	}

	const command = interaction.client.commands.get(
		interaction.commandName,
	);

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
		 * Discord error 10062 means the interaction has expired.
		 * Replying again would only create another error.
		 */
		if (error.code === 10062) {
			console.error(
				`Interaction for /${interaction.commandName} expired.`,
			);

			return;
		}

		const errorMessage = {
			content:
				'There was an error while executing this command!',
			flags: MessageFlags.Ephemeral,
		};

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
				'Unable to send an error response for ' +
				`/${interaction.commandName}:`,
				replyError,
			);
		}
	}
});

process.on('unhandledRejection', (reason) => {
	console.error(
		'Unhandled Promise rejection:',
		reason,
	);
});

process.on('uncaughtException', (error) => {
	console.error(
		'Uncaught exception:',
		error,
	);
});

client.login(token);