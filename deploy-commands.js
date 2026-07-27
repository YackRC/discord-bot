const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];

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

		if (!('data' in command) || !('execute' in command)) {
			console.warn(
				`[WARNING] The command at ${filePath} is missing ` +
				'a required "data" or "execute" property.',
			);

			continue;
		}

		try {
			console.log(`Validating: ${filePath}`);

			const commandData = command.data.toJSON();

			commands.push(commandData);

			console.log(`Valid: /${commandData.name}`);
		}
		catch (error) {
			console.error(`Invalid command: ${filePath}`);
			throw error;
		}
	}
}

const rest = new REST().setToken(token);

(async () => {
	try {
		console.log(
			`Started refreshing ${commands.length} application (/) commands.`,
		);

		const data = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{
				body: commands,
			},
		);

		console.log(
			`Successfully reloaded ${data.length} application (/) commands.`,
		);
	}
	catch (error) {
		console.error('Failed to deploy commands:');
		console.error(error);
		process.exitCode = 1;
	}
})();