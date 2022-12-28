async function main() {
  
    const [owner] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", owner.address);
    console.log("Account balance:", (await owner.getBalance()).toString());

    const databaseFactory = await ethers.getContractFactory("Database");

    const database = await databaseFactory.deploy();
    
    console.log("Deployed contract address is ");
    console.log(await database.address);
}
  
main().then(() => process.exit(0)).catch((error) => {
    console.error(error);
    process.exit(1);
});