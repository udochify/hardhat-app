const TxMiner = function (web3, threads, confirmations) {
    this.eth = web3.eth.extend({
        property: "miner",
        methods: [
            {
                name: "start",
                call: "miner_start",
                params: 1
            },
            {
                name: "stop",
                call: "miner_stop",
                params: 0
            },
        ]
    });
    this.eth.miner.stop();
    this.threads = threads;
    this.confirmations = confirmations;
};

TxMiner.prototype.mine = async function() {
    await this.eth.subscribe("pendingTransactions", async (error, result) => { 
        if(!error) 
            await miner(this.eth, this.threads, this.confirmations);
        else console.log(error);
    });
}

async function miner(eth, threads, confirmations) {
    let txs = await eth.getPendingTransactions();
    if(txs.length > 0) {
        let lastBlock = await eth.getBlock("latest");
        let lastBlockNumber = lastBlock.number;
        let isMining = await eth.isMining();
        if(isMining) return;
        console.log("====Pending transactions. Mining started====");
        eth.miner.start(threads);
        let latestBlock = await eth.getBlock("latest");
        let latestBlockNumber = latestBlock.number;
        while(latestBlockNumber < lastBlockNumber + confirmations) {
            await new Promise(resolve => setTimeout(resolve, 700));
            latestBlock = await eth.getBlock("latest");
            latestBlockNumber = latestBlock.number;
        }
        eth.miner.stop();
        console.log("====Mining completed after " + confirmations + " confirmations====");
    } else {
        eth.miner.stop();
        console.log("====No pending transactions. Mining stopped!====");
    }
}

module.exports = TxMiner;