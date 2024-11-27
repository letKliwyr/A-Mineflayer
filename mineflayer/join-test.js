const mineflayer = require('mineflayer');
const { pathfinder } = require('mineflayer-pathfinder');
const geoip = require('geoip-lite');

const { getUsername } = require('../utils/joinUsername.js')
const { registerList } = require('../utils/joinPassword.js')

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

/* const f = new Map([
    ["ᴊᴀɴɢᴀɴ ʟᴜᴘᴀ ᴠᴏᴛᴇ ᴜɴᴛᴜᴋ ᴋᴀᴍɪ! ᴋᴀᴍᴜ ᴍᴇᴍɪʟɪᴋɪ 0 ᴠᴏᴛᴇ.", `/register M7hqBKkTZNA5cMJq`], // register auth cornezz
    ["[»] You still do not have an email address assigned to your account. Please assign it now using /changemailaddress <password> <email-address>!", console.log("jpremium login detected")],
    ["[»] Hi on Minecraft Server Network! Here you have useful commands:", `/server survivalsf`],
    ["Please register using /register <password>", `/register M7hqBKkTZNA5cMJq M7hqBKkTZNA5cMJq`], // default easy auth
    ["Please register using /register <password>", `/register M7hqBKkTZNA5cMJq`], // default easy auth
    ["Please register using /register <password> <password again>", `/register M7hqBKkTZNA5cMJq M7hqBKkTZNA5cMJq`], // default easy auth
    ["Please log in using /login <password>", '/login M7hqBKkTZNA5cMJq'],
    ["Please, login with the command: /login <password>", '/login M7hqBKkTZNA5cMJq'],
    ["Please register using: /register <password> <password>", `/register M7hqBKkTZNA5cMJq M7hqBKkTZNA5cMJq`],
    ["[»] You are already registered!", '/server survivalsf'],
    ["Use the command /register <password> <password>.", "/register M7hqBKkTZNA5cMJq M7hqBKkTZNA5cMJq "],
    ["Please, register to the server with the command: /register <password> <ConfirmPassword>", '/register M7hqBKkTZNA5cMJq M7hqBKkTZNA5cMJq'], // Authme register default config msg
    ["Successfully logged in.", '/server survival'], // Syahnur07 // Myu_SyaDyr
    ["ᴠᴏᴛᴇ ┃ You have 4 to vote on still!", '/register blackyyy123'],
    ["[»] You are a premium player!", '/server oneblock'],
    ["Please register with /register <password> <password>", '/register n n'],
    ["*Kamu sedang di Limbo* ketik /hub untuk lanjut bermain!", '/register n n'],
    ["* You are currently at Limbo* type /hub to continue playing!", '/register n n'],
    ["/register <password> <password>", '/register blackyyy123 blackyyy123']
]); */


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
    name: 'join-beta',
    execute(message, args) {
        if (args[0] === '-disconnect') {
            if (global.activeBot) {
                global.activeBot.quit();
                console.clear();
                message.channel.send('```diff\n- Bot telah berhasil disconnect dari server```');
                global.activeBot = null;
                return;
            } else {
                return message.channel.send('```diff\n- Bot tidak sedang terhubung ke server manapun```');
            }
        }
         if (!args[0]) return message.channel.send('Mohon masukkan alamat server!');
        
        let username;
        let version = '1.20.4';
        let port = 25565;
        let sendMessage = '';

        
        for (let i = 1; i < args.length; i++) {
            if (args[i] === '-u' && args[i + 1]) {
                username = args[i + 1];
                i++;
            } else if (args[i] === '-v' && args[i + 1]) {
                version = args[i + 1];
                i++;
            } else if (args[i] === '-p' && args[i + 1]) {
                port = args[i + 1];
                i++;
            } else if (args[i] === '-chat' && args[i + 1]) {
                sendMessage  = args[i + 1];
                i++;
            }
        }

        if (!username) {
            try {
                username = getUsername(args);
            } catch (error) {
                return message.channel.send(error.message);
            }
        }

        const options = {
            host: args[0],
            username: username,
            version: version,
            port: port
        };

        function createBot() {
            const bot = mineflayer.createBot(options);
            global.activeBot = bot;
            bot.loadPlugin(pathfinder);

            bot.once('spawn', async () => {
                bot.chat(sendMessage);

                const serverInfo = serverAbout(bot, args[0], bot._client.socket.remoteAddress);
                const sentMessage = await message.reply(discordMessage(serverInfo, 'No players online'));

            
                // Tambahkan event listener untuk chat
                bot.on('messagestr', (message) => {
                    console.log(`[Minecraft Chat] ${message}`);
                    for (let [key, value] of registerList.entries()) {
                        if (message.includes(key)) {
                            let command;
                            if (typeof value === 'function') {
                                const serverInfo = serverAbout(bot, args[0], bot._client.socket.remoteAddress);
                                command = value(serverInfo);
                            } else {
                                command = value;
                            }
                            
                            if (typeof command === 'string' && command.length > 0) {
                                bot.chat(command);
                            }
                            break;
                        }
                    }
                });
                ////////////////////////////////////////////////
                ////////////////////////////////////////////////
                //          - luckynetwork auth  - 
                ////////////////////////////////////////////////
                bot.on('windowOpen', async (window) => {
                    if (!window.title.toLowerCase().includes('click the green glass')) return;
                    
                    const greenGlass = window.slots.find(item => 
                        item && (
                            item.name?.includes('green_stained_glass') ||
                            item.name?.includes('lime_stained_glass') ||
                            [444, 470].includes(item.type)
                        )
                    );
    
                    if (greenGlass) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        await bot.clickWindow(greenGlass.slot, 0, 0);
                    }
                });
                
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

            bot.on('kicked', (longReason) => {
                let reason;
                try {
                    const parsed = JSON.parse(longReason);
                    reason = parsed.extra?.[0]?.text || parsed.text || longReason;
                } catch {
                    reason = longReason;
                }
                // const cleanReason = JSON.parse(reason)?.extra?.[0]?.text || reason;
                message.reply([
                    `\`\`\`diff\n- Failed to jump into the server ${args[0]}:${port}\`\`\``,
                    `\`\`\`py\n@ reason: ${reason}\n@ Bot will reconnect in 5 seconds\`\`\``,
                    `\`\`\`py\n@ bot joins using name: ${bot.username} \`\`\``,

                ].join('\n'));
                
                setTimeout(createBot, 5000);
            });

            return bot;
        }

        createBot();
    }
};