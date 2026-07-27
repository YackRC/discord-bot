const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('fma-school')
	// Create subcommand
		.addSubcommand(subcommand =>
			subcommand
				.setName('deathmatch')
				.setDescription('Are you challenging me to a deathmatch?'),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('tapi-tapi')
				.setDescription('Learn the tapi tapi moves... Hadoken!'),
		),

	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();

		if (subcommand === 'deathmatch') {
			await interaction.reply(
				'https://www.youtube.com/shorts/u8nu-1SNXnc',
			);
		}

		if (subcommand === 'tapi-tapi') {
			await interaction.reply(
				'https://www.youtube.com/shorts/e4M9ALg9F4o',
			);
		}
	},
};