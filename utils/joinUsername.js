const fs = require('fs');
const path = require('path');

const generateLegitUsername = () => {
    let name = '';
    const words = JSON.parse(
        fs.readFileSync(path.join(__dirname, '../utils/word-username/username-words.json'), 'utf-8')
    ).words;
    
    for (let i = 0; i < Math.floor(Math.random() * 1) + 2; i++) {
        name += words[Math.floor(Math.random() * words.length)];
    }
    return name;
};

const generateRandomUsername = () => {
    const length = Math.floor(Math.random() * (16 - 3 + 1)) + 3;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return result;
};

const getUsername = (args) => {
    const type = args[1]?.toLowerCase();
    const customUsername = args[2];

    if (!type) return 'angkasabot_';

    switch(type) {
        case 'random':
        case 'randomusername':
            return generateRandomUsername();
        case 'legit':
        case 'legitusername':
            return generateLegitUsername();
        case 'symbol':
            
        case 'username':
            if (!customUsername) throw new Error('Username tidak boleh kosong! Contoh: ?join <ip> username Steve123');
            if (customUsername.length < 3 || customUsername.length > 16) {
                throw new Error('Username harus antara 3-16 karakter!');
            }
            return customUsername;
        default:
            return 'kliwyrongod';
    }
};

module.exports = { getUsername };