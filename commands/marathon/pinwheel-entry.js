const {
	EmbedBuilder,
	SlashCommandBuilder,
} = require('discord.js');

const routes = [
	{
		name: 'Destroyed Wing Entry',
		difficulty: 'Medium',
		requirements: [
			'A weapon',
			'Access to the rooftop and wing area',
		],
		steps: [
			'Search the rooftop and wing area.',
			'Locate the four hidden power boxes.',
			'Shoot all four power boxes.',
			'Enter through the activated base entrance.',
		],
	},
	{
		name: 'Command Wing Entry',
		difficulty: 'Easy',
		requirements: [
			'Access to the Command Wing',
			'The required keycards',
		],
		steps: [
			'Enter the Command Wing building.',
			'Interact with the terminal. (Need 2 Green Clearance Cards)',
			'Hack the terminal to unlock the base entrance.',
			'Survive the UEC soldier wave during lockdown for elevator.',
			'Use the 3 Red Clearance Cards to access the Pinwheel Hub locked room.',
		],
	},
	{
		name: 'Drone Wing Entry',
		difficulty: 'Medium',
		requirements: [
			'A Conveyance Request Key',
		],
		steps: [
			'Find a Conveyance Request Key in a loot location.',
			'Travel to the Drone Wing command room.',
			'Use the key to activate the secret lift.',
			'Take the lift to bypass the normal keycard route.',
		],
	},
];

function formatRoute(route) {
	return [
		`**Difficulty:** ${route.difficulty}`,
		'',
		'**Requirements**',
		...route.requirements.map((requirement) => `- ${requirement}`),
		'',
		'**Steps**',
		...route.steps.map((step, index) => `${index + 1}. ${step}`),
	].join('\n');
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pinwheel-entry')
		.setDescription('Provides information about entering the Outpost.'),

	async execute(interaction) {
		const embed = new EmbedBuilder()
			.setTitle('Outpost Entry Guide')
			.setDescription(
				'There are three primary methods for entering the Outpost.',
			)
			.addFields(
				routes.map((route) => ({
					name: route.name,
					value: formatRoute(route),
				})),
			)
			.setFooter({
				text: 'Use the route that best matches your available items.',
			});

		await interaction.reply({
			embeds: [embed],
		});
	},
};