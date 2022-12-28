const CryptoJS = require("crypto-js");

const LaravelEncrypt = function (key) { 
    this.key = key; 
};

LaravelEncrypt.prototype.decrypt = function (encryptStr) { 
    encryptStr = CryptoJS.enc.Base64.parse(encryptStr); 
    let encryptData = encryptStr.toString(CryptoJS.enc.Utf8); 
    encryptData = JSON.parse(encryptData);
    var decrypted = CryptoJS.AES.decrypt(encryptData.value, CryptoJS.enc.Base64.parse(this.key), { 
        iv : CryptoJS.enc.Base64.parse(encryptData.iv), 
        mode: CryptoJS.mode.CBC, 
        padding: CryptoJS.pad.Pkcs7 
    }); 
    return CryptoJS.enc.Utf8.stringify(decrypted);
}; 

LaravelEncrypt.prototype.encrypt = function (data) { 
    let key = CryptoJS.enc.Base64.parse(this.key); 
    let options = { 
        iv: CryptoJS.lib.WordArray.random(16), 
        mode: CryptoJS.mode.CBC, 
        padding: CryptoJS.pad.Pkcs7 
    }; 
    let encrypted = CryptoJS.AES.encrypt(data, key, options); 
    encrypted = encrypted.toString(); 
    let result = { 
        iv: CryptoJS.enc.Base64.stringify(options.iv), 
        value: encrypted, 
        mac: CryptoJS.HmacSHA256(options.iv + encrypted, key).toString() 
    } 
    result = JSON.stringify(result);
    result = CryptoJS.enc.Utf8.parse(result);
    return CryptoJS.enc.Base64.stringify(result); 
}; 

module.exports = LaravelEncrypt;