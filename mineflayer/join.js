const mineflayer = require('mineflayer');
const { pathfinder } = require('mineflayer-pathfinder');
const geoip = require('geoip-lite');

const { getUsername } = require('../utils/joinUsername.js')

const providers = ([
    [['139', '51', '15'], 'OVH'],
    [['66', '45'], 'AME Hosting / bloom.host'],
    [['20', '157'], 'Azure'],
    [['46'], 'Contabo'],
    [['172', '192'], 'Linode'],
    [['134', '159'], 'DigitalOcean']
]);

const getProvider = ip => {
    const prefix = ip.split('.')[0];
    return [...providers].find(([keys]) => keys.includes(prefix))?.[1] || 'Unknown';
};

const serverAbout = (bot, host, ip) => ({
    host,
    ip: `${ip}:${bot._client.socket.remotePort}`,
    region: geoip.lookup(ip)?.country || 'N/A',
    provider: getProvider(ip),
    username: bot.username,
    version: bot.version
});

const discordMessage = (info, players) => [
    `\`\`\`md\n> Successfully hopped into the server ${info.host}\`\`\``,
    `\`\`\`py\n@ host: ${info.host}\n@ ip: ${info.ip}\n@ host-region: ${info.region}\n@ host-provider: ${info.provider}\`\`\``,
    `\`\`\`ini\n; player list: ${players}\`\`\``,
    `\`\`\`py\n@- random-username: yes\n@- username: ${info.username}\n@- version: ${info.version}\n@- auth-password: N/A\`\`\``
].join('\n');

module.exports = {
    name: 'join',
    execute(message, args) {
        if (!args[0]) return message.channel.send('Mohon masukkan alamat server!');
        
        let username;
        try {
            username = getUsername(args);
        } catch (error) {
            return message.channel.send(error.message);
        }

        const options = {
            host: args[0],
            username: username,
            version: '1.20.4'
        };

        function createBot() {
            const bot = mineflayer.createBot(options);
            bot.loadPlugin(pathfinder);

            bot.once('spawn', async () => {
                const serverInfo = serverAbout(bot, args[0], bot._client.socket.remoteAddress);
                const sentMessage = await message.reply(discordMessage(serverInfo, 'No players online'));

                const updateInterval = setInterval(() => {
                    const players = Object.keys(bot.players || {}).join(', ') || 'No players online';
                    sentMessage.edit(discordMessage(serverInfo, players));
                }, 10000);

                bot.on('end', () => clearInterval(updateInterval));
            });

            bot.on('error', err => {
                message.channel.send(`Error: ${err.message}`);
                setTimeout(createBot, 5000);
            });

            bot.on('kicked', reason => {
                const cleanReason = JSON.parse(reason)?.extra?.[0]?.text || reason;
                message.reply([
                    `\`\`\`diff\n- Failed to jump into the server ${args[0]}\`\`\``,
                    `\`\`\`py\n@ reason: ${cleanReason}\n@ Bot will reconnect in 5 seconds\`\`\``,
                    `\`\`\`py\n@ bot joins using name: ${bot.getUsername} \`\`\``,

                ].join('\n'));
                
                setTimeout(createBot, 5000);
            });

            return bot;
        }

        createBot();
    }
};