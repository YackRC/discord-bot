const {
	AttachmentBuilder,
	EmbedBuilder,
	SlashCommandBuilder,
} = require('discord.js');
const { outpost } = require('../../data/maps');

const pinwheel = outpost.mapSecrets.mainEvent;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('outpost')
		.setDescription('Commands for Outpost')
		.addSubcommand(subcommand =>
			subcommand
				.setName('info')
		        .setDescription('Basic info about Outpost.'),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('pinwheel-base-entry')
				.setDescription('All entries into the Pinwheel.'),
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

		if (subcommand === 'pinwheel-base-entry') {
			const entries = [pinwheel.entry1, pinwheel.entry2, pinwheel.entry3];
			const files = entries.map((entry, index) =>
				new AttachmentBuilder(entry.entryLocation, {
					name: `pinwheel-entry-${index + 1}.png`,
				}),
			);
			const embeds = entries.map((entry, index) =>
				new EmbedBuilder()
					.setTitle(entry.name)
					.setDescription(`**Cost:** ${entry.keyCost}`)
					.setImage(`attachment://pinwheel-entry-${index + 1}.png`),
			);

			await interaction.reply({
				content: `**${pinwheel.name} Entries**`,
				embeds,
				files,
			});
		}
	},
};
