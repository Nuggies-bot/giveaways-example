// require Nuggies
const Nuggies = require('nuggies');
module.exports.run = async (client, interaction, args) => {
    try {
        const data = await Nuggies.giveaways.getByMessageID(args.getString('id'));
		const msg = await client.guilds.cache.get(data.guildID).channels.cache.get(data.channelID).messages.fetch(args.getString('id'));
		await Nuggies.giveaways.end(msg, data, msg);
    }
    catch (err) {
        console.log(err);
        return interaction.reply('Unable to find the giveaway!');
    }
}

module.exports.config = {
    name: 'end',
    description: 'End a giveaway',
    usage: '?end <messageID>',
    botPerms: [],
    userPerms: ['MANAGE_GUILD'],
    data: {
        name: 'end',
        description: 'Ends a giveaway',
        defaultPermission: true,
        options: [
            {
                name: 'id',
                description: 'ID of the giveaway',
                required: true,
                type: 'STRING',
            },
        ],
    },
}