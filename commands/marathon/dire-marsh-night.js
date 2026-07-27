const { SlashCommandBuilder } = require('discord.js');
const { nightMarsh } = require('../../data/maps');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('night-marsh')
		.setDescription('Commands for Dire Marsh (Night)')
		.addSubcommand(subcommand =>
			subcommand
				.setName('info')
		        .setDescription('Basic info about Dire Marsh (Night).'),
		),
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();

		if (subcommand === 'info') {
			await interaction.reply([
				`**${nightMarsh.name}**`,
				`Threat Level: ${nightMarsh.threat}`,
				`Squad Spawns: ${nightMarsh.squadSpawns}`,
				`Solo Spawns: ${nightMarsh.soloSpawns}`,
				`Points of Interest: ${nightMarsh.POIs.join(', ')}`,
				`Priority Hostile: ${nightMarsh.prioHostileLocation}`,
			].join('\n'));
		}
	},
};