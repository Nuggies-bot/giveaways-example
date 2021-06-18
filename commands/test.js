module.exports.run = async (client, message, args) => {
    message.channel.send('This Works');
}

module.exports.config = {
    name: 'test',
    description: 'Test Command',
    usage: '?test',
    botPerms: [],
    userPerms: ['ADMINISTRATOR'],
    aliases: ['test-command', 'gamer-test']
}