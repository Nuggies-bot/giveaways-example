// require Nuggies
const Nuggies = require('nuggies');
const ms = require('ms')
module.exports.run = async (client, interaction, args) => {
	let requirements = {};
	if (!interaction.member.permissions.has('MANAGE_GUILD')) return interaction.reply('You are not allowed to use this command!');
	const prize = args.getString('prize');
	const host = interaction.user.id;
	const winners = parseInt(args.getNumber('winners'));
	if (args.getRole('role')) {
		const role = args.getRole('role');
		requirements = { enabled: true, roles: [role.id] };
	}

	Nuggies.giveaways.create(client, {
		message: interaction,
		prize: prize,
		host: host,
		winners: winners,
		endAfter: args.getString('endafter'),
		requirements: requirements,
		channelID: interaction.channel.id,
	});

	interaction.reply('Created a giveaway!');
	setTimeout(() => { interaction.deleteReply(); }, 3000);
}

module.exports.config = {
	name: 'start',
	description: 'Start a giveaway',
	usage: '?start <winners> <time> <prize>',
	botPerms: [],
	userPerms: ['MANAGE_GUILD'],
	data: {
		name: 'start',
		description: 'Starts a giveaway',
		defaultPermission: true,
		options: [
			{
				type: 'STRING',
				name: 'prize',
				description: 'Prize of giveaway',
				required: true,
			},
			{
				type: 'NUMBER',
				name: 'winners',
				description: 'Amount of winners in giveaway',
				required: true,
			},
			{
				type: 'STRING',
				name: 'endafter',
				description: 'Time for the giveaway',
				required: true,
			},
			{
				type: 'ROLE',
				name: 'role',
				description: 'The role requirement for giveaway',
				required: false,
			},
		],
	},
}