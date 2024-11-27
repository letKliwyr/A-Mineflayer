const Discord = require("discord.js-selfbot-v13");
const fs = require('fs');

const config = require('./config.json');


const client = new Discord.Client({
    checkUpdate: false,
    intents: [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MESSAGES,
    ],
});

const prefix = config.prefix;

client.commands = new Discord.Collection();

client.on('ready', () => {
    console.log(`${client.user.username} is ready!`);
})

const mineflayerFiles = fs.readdirSync('./mineflayer/').filter(file => file.endsWith('.js'));
for (const file of mineflayerFiles) {
    const command = require(`./mineflayer/${file}`);
 
    client.commands.set(command.name, command);
}
client.on('messageCreate', message => {
    if (!message.content.startsWith(prefix) || message.author.id !== client.user.id) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);   

    if (!command) return;

    command.execute(message, args);
})

client.login(config.token);