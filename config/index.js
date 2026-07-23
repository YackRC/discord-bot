require('dotenv').config({
	quiet: true,
});

const requiredEnvironmentVariables = [
	'DISCORD_TOKEN',
	'CLIENT_ID',
	'GUILD_ID',
	'UPDATE_CHANNEL_ID',
];

for (const variable of requiredEnvironmentVariables) {
	if (!process.env[variable]) {
		throw new Error(
			`Missing required environment variable: ${variable}`,
		);
	}
}

module.exports = {
	token: process.env.DISCORD_TOKEN,
	clientId: process.env.CLIENT_ID,
	guildId: process.env.GUILD_ID,
	updateChannelId: process.env.UPDATE_CHANNEL_ID,

	/*
	 * Change this if your server should use another time zone.
	 */
	updateTimezone:
		process.env.UPDATE_TIMEZONE || 'America/New_York',
};