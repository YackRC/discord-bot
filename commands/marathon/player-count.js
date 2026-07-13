const { SlashCommandBuilder } = require('discord.js');
const { getPlayerCount } = require('../../services/steam.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('player-count')
		.setDescription('Get the current player count for Marathon on Steam.'),

	async execute(interaction) {
		// Discord expects an initial response within a few seconds.
		// Defer the reply while waiting for Steam's API.
		await interaction.deferReply();

		try {
			const playerCount = await getPlayerCount();

			await interaction.editReply(`There are currently **${playerCount}** runners in Marathon.`);
		}
		catch (error) {
			console.error('Error fetching player count:', error);
			await interaction.editReply('Failed to fetch player count.');
		}
	},
};