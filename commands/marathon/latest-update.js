const { SlashCommandBuilder } = require('discord.js');
const { getLatestUpdate } = require('../../services/steam.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('latest-update')
		.setDescription('Fetch the latest game update from Steam.'),

	async execute(interaction) {
		await interaction.deferReply();

		try {
			const appNews = await getLatestUpdate();
			const latestUpdate = appNews.newsitems[0];

			if (!latestUpdate) {
				throw new Error('Steam returned no news items.');
			}

			await interaction.editReply(
				`**${latestUpdate.title}**\n${latestUpdate.url}`,
			);
		}
		catch (error) {
			console.error('Failed to fetch latest update:', error);

			await interaction.editReply({
				content: 'Failed to fetch the latest game update.',
			});
		}
	},
};
