const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const routes = [
	{
		name: 'Destroyed Wing',
		requirements: 'Shoot 4 White Power boxes hidden around Orientaion and the Destroyed Wing.',
	},
	{
		name: '',
	},
];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pinwheel-entry')
		.setDescription('Provides information about the Outpost Guide.'),
	async execute(interaction) {
		const response = [
			'- Destroyed Wing Entry: This route requires you to locate and shoot 4 power boxes hidden around the rooftop and wing area to activate the base entrance.',
			'- Command Wing Entry: Generally considered the most straightforward entry. Head to the Command Wing building, interact with the terminal to reveal the required keycard combination, survive the UEC soldier wave during the lockdown, and access the base.',
			'- Drone Wing Entry: You can use a conveyance request key (found in loot locations) in the Drone Wing command room to activate a secret lift, bypassing standard keycard requirements.',
		].join('\n');
		await interaction.reply(response);;
	},
};