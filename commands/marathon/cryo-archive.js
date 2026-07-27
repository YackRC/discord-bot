const { SlashCommandBuilder } = require('discord.js');
const { cryoArchive } = require('../../data/maps');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('cryo-archive')
		.setDescription('Commands for Cryo Archive.')
		.addSubcommand(subcommand =>
			subcommand
				.setName('info')
		        .setDescription('Basic info about Cryo Archive.'),
		),
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();

		if (subcommand === 'info') {
			await interaction.reply([
				`**${cryoArchive.name}**`,
				`Threat Level: ${cryoArchive.threat}`,
				`Squad Spawns: ${cryoArchive.squadSpawns}`,
				`Solo Spawns: ${cryoArchive.soloSpawns}`,
				`Points of Interest: ${cryoArchive.POIs.join(', ')}`,
				`Priority Hostile: ${cryoArchive.prioHostileLocation}`,
			].join('\n'));
		}
	},
};