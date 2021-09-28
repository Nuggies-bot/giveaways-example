// require Nuggies
const Nuggies = require('nuggies');
const  { MessageButton } = require('discord.js');
module.exports.run = async (client, interaction, args) => {
    let win;
    try {
        win = await Nuggies.giveaways.reroll(client, args.getString('id'));
    }
    catch (err) {
        console.log(err);
        return interaction.reply('Unable to find the giveaway!');
    }
    if (!win[0]) return interaction.reply('There are not enough people in the giveaway!');
    interaction.reply(`Rerolled! <@${win}> is the new winner of the giveaway!`, { component: new MessageButton().setLabel('Giveaway').setURL(`https://discord.com/channels/${message.guild.id}/${message.channel.id}/${args[0]}`).setStyle('url') });
}

module.exports.config = {
    name: 'reroll',
    description: 'Reroll a giveaway',
    usage: '?reroll <messageID>',
    botPerms: [],
    userPerms: ['MANAGE_GUILD'],
    data: {
        name: 'reroll',
        description: 'Rerolls a giveaway',
        defaultPermission: true,
        options: [
            {
                type: 'STRING',
                name: 'id',
                description: 'ID of the giveaway',
                required: true,
            },
        ],
    },
}