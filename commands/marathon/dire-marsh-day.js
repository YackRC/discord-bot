const { SlashCommandBuilder } = require('discord.js');
const { dayMarsh } = require('../../data/maps');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('day-marsh')
		.setDescription('Commands for Dire Marsh (Day)')
		.addSubcommand(subcommand =>
			subcommand
				.setName('info')
		        .setDescription('Basic info about Dire Marsh (Day).'),
		),
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();

		if (subcommand === 'info') {
			await interaction.reply([
				`**${dayMarsh.name}**`,
				`Threat Level: ${dayMarsh.threat}`,
				`Squad Spawns: ${dayMarsh.squadSpawns}`,
				`Solo Spawns: ${dayMarsh.soloSpawns}`,
				`Points of Interest: ${dayMarsh.POIs.join(', ')}`,
				`Priority Hostile: ${dayMarsh.prioHostileLocation}`,
			].join('\n'));
		}
	},
};