// require Nuggies
const Nuggies = require('Nuggies');
module.exports.run = async (client, message, args) => {
    if (!args[0]) return message.reply('Please provide a message ID of the giveaway to end!', { allowedMentions: { repliedUser: false } });
    try {
        await Nuggies.giveaways.end(client, args[0], args[1] === true, button);
    }
    catch (err) {
        console.log(err);
        return message.channel.send('Unable to find the giveaway!');
    }
}

module.exports.config = {
    name: 'end',
    description: 'End a giveaway',
    usage: '?end <messageID>',
    botPerms: [],
    userPerms: ['MANAGE_GUILD'],
    aliases: []
}