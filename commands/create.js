// require Nuggies
const Nuggies = require('nuggies');
const giveaway = {};
const ms = require('ms');
module.exports.run = async (client, interaction, args) => {
    const filter = m => m.author.id === interaction.user.id;
    const collector = interaction.channel.createMessageCollector({ filter, max: 7, time: 60 * 1000 });
    let step = 0;

    interaction.reply('What is the prize?');
    collector.on('collect', async (msg) => {
        if (!msg.content) return collector.stop('error');

        step++;
        if (step == 1) {
            const prize = msg.content;
            interaction.channel.send(`The prize is **${prize}**! Which channel do you want to host in?`, { allowedMentions: { roles: [], users: [], parse: [] } });
            giveaway.prize = prize;
        }
        else if (step == 2) {
            const channel = msg.mentions.channels.first() || msg.guild.channels.cache.get(msg.content);
            if (!channel) return collector.stop('error');
            giveaway.channel = channel.id;
            interaction.channel.send(`Channel is <#${channel.id}>! Now how many winners do you want?`);
        }
        else if (step == 3) {
            const winners = msg.content;
            if (isNaN(winners)) return collector.stop('error');
            if (parseInt(winners) > 10) {
                interaction.reply('You cannot have more than 10 winners!');
                return collector.stop('error');
            }
            giveaway.winners = parseInt(winners);
            interaction.channel.send(`${winners} winner(s) will be chosen for this giveaway! How much time do you want?`);
        }
        else if (step == 4) {
            const time = msg.content;
            if (!ms(time)) return collector.stop('error');
            giveaway.time = time
            if (ms(giveaway.time) > ms('14d')) return collector.stop('HIGH_TIME');
            interaction.channel.send(`The time is now set to ${time}! Who is hosting the giveaway?`);
        }
        else if (step == 5) {
            const host = msg.mentions.users.first() || msg.guild.members.cache.get(msg.content) || interaction.member;

            giveaway.host = host.id;
            interaction.channel.send(`The host is ${host}! Now do you want any requirements for the giveaway?`);
        }
        else if (step == 6) {
            if (!['yes', 'no'].includes(msg.content.toLowerCase())) return collector.stop('error');
            giveaway.requirements = { enabled: msg.content == 'yes' ? true : false };
            return interaction.channel.send(`Is this correct?\n\`\`\`Prize: ${giveaway.prize}\nWinner(s): ${giveaway.winners}\nTime: ${ms(giveaway.time)}\nhost: ${interaction.guild.members.cache.get(giveaway.host).user.username}\nRequirements: ${giveaway.requirements.enabled ? 'Yes' : 'No'}\n\`\`\`Reply with \`yes\` or \`no\`!`);
        }
        else if (step == 7) {
            if (!['yes', 'no'].includes(msg.content)) return collector.stop('error');
            if (msg.content == 'yes') return collector.stop('done');
            if (msg.content == 'no') return collector.stop('cancel');
        }
    });

    collector.on('end', async (msgs, reason) => {
        if (reason == 'time') return interaction.channel.send('You did not reply in time!');
        if (reason == 'error') return interaction.channel.send('You did not provide valid option!');
        if (reason == 'cancel') return interaction.channel.send('Cancelled giveaway setup due to wrong info!');
        if (reason == 'HIGH_TIME') return interaction.channel.send('The time cannot be more than 14 days!');

        if (reason == 'done' && giveaway.requirements.enabled) {
            interaction.channel.send('You can use role requirements: `role=ID`!(without spaces) Once you are finished putting requirements say `done`');
            const rcollector = interaction.channel.createMessageCollector({ filter, time: 60 * 1000, max: 1000 });
            rcollector.on('collect', async (m) => {

                if (!['done', 'stop', 'cancel'].includes(m.content.toLowerCase()) && !m.content.includes('role=')) return rcollector.stop('error');
                if (m.content.toLowerCase() == 'done') return rcollector.stop('done');

                if (!giveaway.requirements.roles) giveaway.requirements.roles = [];
                const id = m.content.split(' ').join('').split('=')[1];

                if (!interaction.guild.roles.cache.get(id)) return interaction.channel.send('That is not a valid role!');
                giveaway.requirements.roles.push(m.content.split(' ').join('').split('=')[1]);
                interaction.channel.send(`Added the role to requirements!\n\`\`\`\n${giveaway.requirements.roles.map(x => interaction.guild.roles.cache.get(x).name).join('\n')}\n\`\`\``, { allowedMentions: { roles: [], parse: [], users: [] } });
            });

            rcollector.on('end', async (msg, r) => {
                if (r == 'time') return interaction.channel.send('You did not reply in time!');
                if (r == 'error') return interaction.channel.send('You did not provide valid option!');
                if (r == 'cancel') return interaction.channel.send('Cancelled giveaway setup due to wrong info!');

                if (r == 'done') {
                    console.log(giveaway)

                    Nuggies.giveaways.create({
                        message: interaction, prize: giveaway.prize, host: giveaway.host, winners: giveaway.winners, endAfter: giveaway.time, requirements: giveaway.requirements, channel: giveaway.channel,
                    });
                    await interaction.channel.send('Created a giveaway!').then(m => setTimeout(() => m.delete(), 2000));
                }
            });
        }
        else {
            Nuggies.giveaways.create(client, {
                message: interaction,
                prize: giveaway.prize,
                host: giveaway.host,
                winners: giveaway.winners,
                endAfter: giveaway.time,
                requirements: giveaway.requirements,
                channel: giveaway.channel,
            });
            await interaction.channel.send('Created a giveaway!').then(m => setTimeout(() => m.delete(), 2000));
        }
    });
}

module.exports.config = {
    name: 'create',
    description: 'Create a giveaway',
    usage: '?create',
    botPerms: [],
    userPerms: ['MANAGE_GUILD'],
    data: {
        name: 'create',
        description: 'Creates a giveaway',
        defaultPermission: true,
    },
}
