const fs = require('fs');
const path = require('path');

const pathPasswordlogs = path.join(__dirname, '../logs/passwordLogs.json');

const { sendPasswordLog } = require('./joinWebhookLog.js');
const generatePassword = () => {
   const length = 6;
   const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   let result = '';
   
   for (let i = 0; i < length; i++) {
       result += characters.charAt(Math.floor(Math.random() * characters.length));
   }
   
   return result;
};

const savePassword = (serverInfo, password) => {
    try {
        const data = JSON.parse(fs.readFileSync(pathPasswordlogs, 'utf8'));
        data.passwords[`${serverInfo.host}_${serverInfo.username}`] = password;
        fs.writeFileSync(pathPasswordlogs, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving password:', error);
    }
};

const getsavePassword = (serverInfo) => {
    try {
        const data = JSON.parse(fs.readFileSync(pathPasswordlogs, 'utf8'));
        if (!serverInfo || !serverInfo.host || !serverInfo.username) {
            console.error('Invalid serverInfo:', serverInfo);
            return null;
        }
        return data.passwords[`${serverInfo.host}_${serverInfo.username}`];
    } catch (error) {
        console.error('Error reading password:', error);
        return null;
    }
};

const handleRegistration = (serverInfo) => {
    const password = generatePassword();
    savePassword(serverInfo, password);
    sendPasswordLog(serverInfo, password);
    return `/register ${password} ${password}`;
}

const handleLogin = (serverInfo) => {
    const password = getsavePassword(serverInfo);
    if (password) {
        return `/login ${password}`;
    }
    const loginpassword = generatePassword();
    savePassword(serverInfo, loginpassword);
    return `/login ${loginpassword}`;
};

const registerList = new Map([
   ["You have 43 seconds to register.", handleRegistration],
   ["[»] You still do not have an email address assigned to your account.", ""],
   ["[»] Hi on Minecraft Server Network! Here you have useful commands:", "/server survivalsf"],
   ["Please register with /register <password> <password>", handleRegistration],

   ["Successfully registered your account.", ''],
   
   ["Use the command /register <password> <password>.", handleRegistration],
   ["Please, register to the server with the command: /register <password> <ConfirmPassword>", handleRegistration],

   // login 

   ["You have 43 seconds to login.", handleLogin],
   ["Please log in using /login <password>", handleLogin],
   ["Please, login with the command: /login <password>", handleLogin]
])
module.exports = {
   registerList
};