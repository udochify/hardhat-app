var contract, provider;
const express = require('express');
const ethers = require('ethers');
const { Network, Alchemy } = require('alchemy-sdk');

const owner = "0x13F7C4C2AFc49e80F881d56B565aBAa94c3703Cd";
const contractAddress = "0xE5E902FE33f20090a8534368792f9732CFC6b64B";
const privateKey = "**************************************************************";
const abi = [ { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "useraddr", "type": "address" }, { "indexed": false, "internalType": "address", "name": "contactaddr", "type": "address" } ], "name": "ContactAdded", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "useraddr", "type": "address" }, { "indexed": false, "internalType": "address", "name": "contactaddr", "type": "address" } ], "name": "ContactRemoved", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "useraddr", "type": "address" }, { "indexed": false, "internalType": "address", "name": "fileaddr", "type": "address" }, { "indexed": false, "internalType": "string", "name": "name", "type": "string" }, { "indexed": false, "internalType": "string", "name": "path", "type": "string" } ], "name": "FileAdded", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "fileaddr", "type": "address" } ], "name": "FileDeleted", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "fileaddr", "type": "address" }, { "indexed": false, "internalType": "address", "name": "useraddr", "type": "address" } ], "name": "FileShared", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "fileaddr", "type": "address" } ], "name": "FileUnshared", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "fileaddr", "type": "address" } ], "name": "FileUpdated", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "useraddr", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "id", "type": "uint256" }, { "indexed": false, "internalType": "string", "name": "name", "type": "string" }, { "indexed": false, "internalType": "string", "name": "email", "type": "string" } ], "name": "UserAdded", "type": "event" }, { "inputs": [ { "internalType": "address", "name": "useraddr", "type": "address" }, { "internalType": "address", "name": "contactaddr", "type": "address" } ], "name": "addContact", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "owneraddr", "type": "address" }, { "internalType": "address", "name": "fileaddr", "type": "address" }, { "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "path", "type": "string" }, { "internalType": "string", "name": "filestring", "type": "string" } ], "name": "addFile", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "useraddr", "type": "address" }, { "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "email", "type": "string" } ], "name": "addUser", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "fileaddr", "type": "address" } ], "name": "deleteFile", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "", "type": "string" } ], "name": "emails", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "filecount", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "files", "outputs": [ { "internalType": "uint256", "name": "id", "type": "uint256" }, { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "uint256", "name": "ownerkey", "type": "uint256" }, { "internalType": "string", "name": "name", "type": "string" }, { "internalType": "uint256", "name": "size", "type": "uint256" }, { "internalType": "string", "name": "path", "type": "string" }, { "internalType": "bytes32", "name": "crc", "type": "bytes32" }, { "internalType": "bool", "name": "exists", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "useraddr", "type": "address" } ], "name": "getContacts", "outputs": [ { "internalType": "address[]", "name": "", "type": "address[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "fileaddr", "type": "address" } ], "name": "getFileusers", "outputs": [ { "internalType": "address[]", "name": "", "type": "address[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "useraddr", "type": "address" } ], "name": "getUserfiles", "outputs": [ { "internalType": "address[]", "name": "", "type": "address[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "fileaddr", "type": "address" }, { "internalType": "string", "name": "filestring", "type": "string" } ], "name": "matchFile", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "maxfileid", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "maxuserid", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "", "type": "string" } ], "name": "paths", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "useraddr", "type": "address" }, { "internalType": "address", "name": "contactaddr", "type": "address" } ], "name": "removeContact", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "fileaddr", "type": "address" }, { "internalType": "address", "name": "useraddr", "type": "address" } ], "name": "shareFile", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "fileaddr", "type": "address" }, { "internalType": "address", "name": "useraddr", "type": "address" } ], "name": "unshareFile", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "fileaddr", "type": "address" } ], "name": "unshareFile", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "fileaddr", "type": "address" }, { "internalType": "string", "name": "filestring", "type": "string" } ], "name": "updateFile", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "usercount", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "users", "outputs": [ { "internalType": "uint256", "name": "id", "type": "uint256" }, { "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "email", "type": "string" }, { "internalType": "bool", "name": "exists", "type": "bool" } ], "stateMutability": "view", "type": "function" } ];
const settings = {
  apiKey: "-s8G-dPTNIRNp1SNGEwzvlYibgtloMni",
  network: Network.ETH_GOERLI,
};

const app = express();
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());
const alchemy = new Alchemy(settings);

process.on("uncaughtException", error => {
    console.error("Udo Uncaught Exception", error);
    // process.exit(1); // comment if you don't want your entire application to exit on error
});

app.post('/upload', async (req, res) => {
    try {
        if(req.body.address === ethers.utils.computeAddress(req.body.key)) {
            const wallet = ethers.Wallet.createRandom();
            const newfile = await contract.addFile(req.body.address, wallet.address, req.body.name, req.body.path, req.body.hash);
            if(newfile){
                const filter = {
                    address: contractAddress,
                    topics: [
                        // the name of the event, parnetheses containing the data type of each event, no spaces
                        ethers.utils.id("FileAdded(address,address,string,string)")
                    ]
                };
                contract.once(filter, async() => {
                    res.json({success: true, address: wallet.address, message: "new file created"});
                    console.log("Total number of Files: " + await contract.filecount());
                    console.log("New file created: \n" + await contract.files(wallet.address));
                });
            } else {
                res.json({error: true, message: "Unable to create file. Try again."});
                console.log("Error: File creation failed");
            }
        } else {
            res.json({error: true, message: "Invalid private key. Contact admin."});
            console.log("Error: Invalid private key");
        }
    } catch (error) {
        res.json({error: true, message: "Blockchain server error. Contact admin."});
        console.log("Error: Blockchain server error " + error);
    }
});

app.post('/crc', async (req, res) => {
    try {
        const result = await contract.matchFile(req.body.address, req.body.hash);
        if(result) {
            console.log("file: " + req.body.address + " passed CRC. Status: " + result); 
            res.json({success:true, status: "Passed", message: "Passed CRC"});
        } else {
            console.log("file: " + req.body.address + " failed CRC. Status: " + result);
            res.json({success:true, status: "Failed", message: "Failed CRC"});
        }
    } catch (error) {
        res.json({error: true, message: "Blockchain server error. Contact admin."});
        console.log("Error: Blockchain server error " + error);
    }
});

app.post('/deletefile', async (req, res) => {
    try {
        if(req.body.user === ethers.utils.computeAddress(req.body.key)) {
            const result = await contract.deleteFile(req.body.address);
            if(result){
                const filter = {
                    address: contractAddress,
                    topics: [
                        // the name of the event, parnetheses containing the data type of each event, no spaces
                        ethers.utils.id("FileDeleted(address)")
                    ]
                };
                contract.once(filter, async() => {
                    res.json({success: true, message: "file deleted successfully"});
                    console.log("File with address: " + req.body.address + " has been deleted successfully");
                    console.log("Total number of Files: " + await contract.filecount());
                });
            } else {
                res.json({error: true, message: "Unable to delete file. Try again."});
                console.log("Error: File deletion failed");
            }
        } else {
            res.json({error: true, message: "Invalid private key. Contact admin."});
            console.log("Error: Invalid private key");
        }
    } catch (error) {
        res.json({error: true, message: "Blockchain server error. Contact admin."});  
        console.log("Error: Blockchain server error " + error);     
    }
});

app.post('/register', async (req, res) => {
    try {
        const wallet = ethers.Wallet.createRandom();
        const newuser = await contract.addUser(wallet.address, req.body.name, req.body.email);
        if(newuser) {
            const filter = {
                address: contractAddress,
                topics: [
                    // the name of the event, parnetheses containing the data type of each event, no spaces
                    ethers.utils.id("UserAdded(address,uint256,string,string)")
                ]
            };
            contract.once(filter, async() => {
                res.json({success: true, address: wallet.address, key: wallet.privateKey, message: "new account created"});
                console.log("Total number of users: " + await contract.usercount());
                console.log("New user account created: \n" + await contract.users(wallet.address));
            });
        }
        else {
            res.json({error: true, message: "Unable to create account, try again"});
            console.log("Error: User Account creation failed");
        }
    } catch (error) {
        res.json({error: true, message: "Blockchain server error. Contact admin."});
        console.log("Error: Blockchain server error " + error);
    }
});

app.listen(3005, '0.0.0.0', async () => {
    provider = await alchemy.config.getProvider();
    const signer = new ethers.Wallet(privateKey, provider);
    contract = new ethers.Contract(contractAddress , abi , signer);
    console.log('Server is listening at http://0.0.0.0:3005');
});
