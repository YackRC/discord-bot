const { SlashCommandBuilder } = require('discord.js');

const {
	getLatestUpdate,
} = require('../../services/steam');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('latest-update')
		.setDescription(
			'Displays the newest official Marathon update.',
		),

	async execute(interaction) {
		await interaction.deferReply();

		try {
			const latestUpdate = await getLatestUpdate();

			await interaction.editReply({
				content:
					`**${latestUpdate.title}**\n` +
					latestUpdate.url,
			});
		}
		catch (error) {
			console.error(
				'Failed to fetch latest update:',
				error,
			);

			await interaction.editReply({
				content:
					'Unable to fetch the latest Marathon update.',
			});
		}
	},
};