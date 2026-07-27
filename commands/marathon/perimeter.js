const { SlashCommandBuilder } = require('discord.js');
const { perimeter } = require('../../data/maps');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('perimeter')
        .setDescription('Commands for Perimeter')
		.addSubcommand(subcommand =>
			subcommand
				.setName('info')
		        .setDescription('Basic info about Perimeter.'),
		),
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();

		if (subcommand === 'info') {
			await interaction.reply([
				`**${perimeter.name}**`,
				`Threat Level: ${perimeter.threat}`,
				`Squad Spawns: ${perimeter.squadSpawns}`,
				`Solo Spawns: ${perimeter.soloSpawns}`,
				`Points of Interest: ${perimeter.POIs.join(', ')}`,
				`Priority Hostile: ${perimeter.prioHostileLocation}`,
			].join('\n'));
		}
	},
};