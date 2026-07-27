const { SlashCommandBuilder } = require('discord.js');
const { perimeter } = require('../../data/maps');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('perimeter')
		.addSubcommand('info')
		.setDescription('Basic info about Perimeter.'),

	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();

		if (subcommand === 'info') {
			await interaction.reply(
				`**${perimeter.name}**\n
                Threat Level: ${perimeter.threat}\n
                Squad Spawns: ${perimeter.squadSpawns}\n
                Solo Spawns: ${perimeter.soloSpawns}\n
                Points of Interest: ${perimeter.POIs.join(', ')}\n
                Priority Hostile: ${perimeter.prioHostileLocation}`,
			);
		}
	},
};