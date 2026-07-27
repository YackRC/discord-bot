const { SlashCommandBuilder } = require('discord.js');
const { outpost } = require('../../data/maps');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('outpost')
		.setDescription('Commands for Outpost')
		.addSubcommand(subcommand =>
			subcommand
				.setName('info')
		        .setDescription('Basic info about Outpost.'),
		),
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();

		if (subcommand === 'info') {
			await interaction.reply([
				`**${outpost.name}**`,
				`Threat Level: ${outpost.threat}`,
				`Squad Spawns: ${outpost.squadSpawns}`,
				`Solo Spawns: ${outpost.soloSpawns}`,
				`Points of Interest: ${outpost.POIs.join(', ')}`,
				`Priority Hostile: ${outpost.prioHostileLocation}`,
			].join('\n'));
		}
	},
};