const { SlashCommandBuilder } = require('discord.js');

const MARATHON_APP_ID = '3065800';
const STEAM_PLAYER_COUNT_URL = `https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${MARATHON_APP_ID}`;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('player-count')
		.setDescription('Get the current player count for Marathon on Steam.'),

	async execute(interaction) {
		// Discord expects an initial response within a few seconds.
		// Defer the reply while waiting for Steam's API.
		await interaction.deferReply();

		try {
			const res = await fetch(STEAM_PLAYER_COUNT_URL);

			if (!res.ok) {
				throw new Error(
					`Steam API returned ${res.status} ${res.statusText}`,
				);
			}

			const data = await res.json();
			const playerCount = data.response.player_count;

			await interaction.editReply(`There are currently **${playerCount.toLocaleString()}** players in Marathon.`);
		}
		catch (error) {
			console.error('Error fetching player count:', error);
			await interaction.editReply('Failed to fetch player count.');
		}
	},
};