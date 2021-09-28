require('dotenv').config();
const Discord = require('discord.js');
// require Nuggies package
const Nuggies = require('nuggies');
// customizability
const defaultGiveawayMessages = {
	dmWinner: true,
	giveaway: '🎉🎉 **GIVEAWAY!** 🎉🎉',
	giveawayDescription: '🎁 Prize: **{prize}**\n🎊 Hosted by: {hostedBy}\n⏲️ Winner(s): `{winners}`\n\nRequirements: {requirements}',
	endedGiveawayDescription : '🎁 Prize: **{prize}**\n🎊 Hosted by: {hostedBy}\n⏲️ Winner(s): {winners}',
	giveawayFooterImage: 'https://cdn.discordapp.com/emojis/843076397345144863.png',
	winMessage: 'congrats {winners}! you won `{prize}`!! Total `{totalParticipants}` members participated and your winning percentage was `{winPercentage}%`',
	rerolledMessage: 'Rerolled! {winner} is the new winner of the giveaway!', // only {winner} placeholder
	toParticipate: '**Click the Enter button to enter the giveaway!**',
	newParticipant: 'You have successfully entered for this giveaway! your win percentage is `{winPercentage}%` among `{totalParticipants}` other participants', // no placeholders | ephemeral
	alreadyParticipated: 'you already entered this giveaway!', // no placeholders | ephemeral
	noParticipants: 'There are not enough people in the giveaway!', // no placeholders
	noRole: 'You do not have the required role(s)\n{requiredRoles}\n for the giveaway!', // only {requiredRoles} | ephemeral
	dmMessage: 'You have won a giveaway in **{guildName}**!\nPrize: [{prize}]({giveawayURL})',
	noWinner: 'Not enough people participated in this giveaway.', // no {winner} placerholder
	alreadyEnded: 'The giveaway has already ended!', // no {winner} placeholder
	dropWin: '{winner} Won The Drop!!',
};
const client = new Discord.Client({ intents: 32767 });
const fs = require('fs');
Nuggies.giveaways.Messages(client, {})
// Connect to the database
Nuggies.connect(process.env.mongoURI);

// login to the bot
client.login(process.env.BOT_TOKEN);

client.on('ready', () => {
    console.log(`${client.user.tag} is online.`)
    Nuggies.giveaways.startAgain(client);
});

// handle giveaway buttons
Nuggies.handleInteractions(client)

// setup custom messages

Nuggies.Messages(bot, {
	giveawayOptions: defaultGiveawayMessages,
});

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();

fs.readdir('./commands/', (err, files) => {
    if (err) console.log(err);
    const file = files.filter(f => f.split('.').pop() === 'js');
    if (file.length < 1) {
        console.log('No Commands.');
        return;
    }
    file.forEach(f => {
        const pull = require(`./commands/${f}`);
        client.commands.set(pull.config.name, pull);
        pull.config.aliases.forEach(aliases => client.aliases.set(aliases, pull.config.name));
    });
});

client.on('message', async message => {
    const prefix = '.'
    if (message.author.bot || message.channel.type === 'dm') return;
    if (message.content.startsWith(prefix)) {
        const messageArray = message.content.split(' ');
        const cmd = messageArray[0]
        const args = messageArray.slice(1);
        const command = client.commands.get(cmd.slice(prefix.length)) || client.commands.get(client.aliases.get(cmd.slice(prefix.length)));
        if (command) {
            if (!command.config.botPerms) return console.log("You didn't provide botPerms");
            if (!Array.isArray(command.config.botPerms)) return console.log('botPerms must be an array.');
            if (!command.config.userPerms) return console.log("You didn't provide userPerms.");
            if (!Array.isArray(command.config.userPerms)) return console.log('userPerms must be an array.')
            if (!message.guild.me.permissions.has(command.config.botPerms)) {
                const beauty = command.config.botPerms.join('\`, \`');
                const noBotPerms = new Discord.MessageEmbed()
                    .setTitle('Missing Permissions')
                    .setDescription(`I am missing these permissions: \`${beauty}\`.`)
                    .setColor('RED');
                return message.channel.send({ embeds: [noBotPerms] })
            }
            if (!message.member.permissions.has(command.config.userPerms)) {
                const beauty = command.config.userPerms.join('\`, \`');
                const noUserPerms = new Discord.MessageEmbed()
                    .setTitle('Missing Permissions')
                    .setDescription(`You are missing these permissions: \`${beauty}\`.`)
                    .setColor('RED');
                return message.channel.send({ embeds: [noUserPerms] })
            }

            command.run(client, message, args);
        }
    }
});
