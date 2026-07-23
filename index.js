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

const client = new Client({
	intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();

/*
 * Load slash commands from:
 *
 * commands/<category>/<command>.js
 */
const foldersPath = path.join(
	__dirname,
	'commands',
);

const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(
		foldersPath,
		folder,
	);

	if (!fs.statSync(commandsPath).isDirectory()) {
		continue;
	}

	const commandFiles = fs
		.readdirSync(commandsPath)
		.filter((file) => file.endsWith('.js'));

	for (const file of commandFiles) {
		const filePath = path.join(
			commandsPath,
			file,
		);

		const command = require(filePath);

		if ('data' in command && 'execute' in command) {
			client.commands.set(
				command.data.name,
				command,
			);
		}
		else {
			console.warn(
				`[WARNING] ${filePath} is missing ` +
				'"data" or "execute".',
			);
		}
	}
}

/*
 * Run one Steam update check.
 *
 * Errors are caught here so a temporary Steam or Discord
 * failure does not terminate the bot.
 */
async function runUpdateCheck() {
	console.log(
		`[${new Date().toISOString()}] ` +
		'Checking for Marathon updates...',
	);

	try {
		const postedCount = await checkAndPostUpdates(
			client,
			updateChannelId,
		);

		console.log(
			'Update check complete. Posted ' +
			`${postedCount} message(s).`,
		);
	}
	catch (error) {
		console.error(
			'Marathon update check failed:',
			error,
		);
	}
}

client.once(
	Events.ClientReady,
	async (readyClient) => {
		console.log(
			`Ready! Logged in as ${readyClient.user.tag}`,
		);

		/*
		 * Check immediately whenever the bot starts.
		 */
		await runUpdateCheck();

		/*
		 * Run at the beginning of every hour from:
		 *
		 * 12:00 PM through 8:00 PM.
		 *
		 * Six-field node-cron format:
		 * second minute hour day month weekday
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
			'Marathon update checker scheduled hourly ' +
			`from 12 PM through 8 PM in ${updateTimezone}.`,
		);
	},
);

client.on(
	Events.InteractionCreate,
	async (interaction) => {
		if (!interaction.isChatInputCommand()) {
			return;
		}

		const command = interaction.client.commands.get(
			interaction.commandName,
		);

		if (!command) {
			console.error(
				'No command matching ' +
				`/${interaction.commandName} was found.`,
			);

			return;
		}

		try {
			await command.execute(interaction);
		}
		catch (error) {
			console.error(
				'Error executing ' +
					`/${interaction.commandName}:`,
				error,
			);

			/*
			 * Unknown Interaction: replying again will fail.
			 */
			if (error.code === 10062) {
				console.error(
					`Interaction /${interaction.commandName} ` +
						'expired before acknowledgement.',
				);

				return;
			}

			const errorMessage = {
				content:
					'There was an error while executing ' +
					'this command!',
				flags: MessageFlags.Ephemeral,
			};

			try {
				if (
					interaction.replied ||
					interaction.deferred
				) {
					await interaction.followUp(
						errorMessage,
					);
				}
				else if (interaction.isRepliable()) {
					await interaction.reply(
						errorMessage,
					);
				}
			}
			catch (replyError) {
				console.error(
					'Unable to send an error response ' +
						`for /${interaction.commandName}:`,
					replyError,
				);
			}
		}
	},
);

process.on(
	'unhandledRejection',
	(reason) => {
		console.error(
			'Unhandled Promise rejection:',
			reason,
		);
	},
);

process.on(
	'uncaughtException',
	(error) => {
		console.error(
			'Uncaught exception:',
			error,
		);
	},
);

client.login(token);