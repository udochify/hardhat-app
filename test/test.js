const { expect } = require("chai");

describe("Database contract", function () {
  it("Just testing", async function () {
    const [owner] = await ethers.getSigners();

    const Database = await ethers.getContractFactory("Database");

    const hardhatDatabase = await Database.deploy();

    const tx = await hardhatDatabase.addUser("5", owner.address, "udo1", "ud1@yahoo.com");
    await hardhatDatabase.addUser("6", "0x13F7C4C2AFc49e80F881d56B565aBAa94c3703Cd", "udo2", "ud4@yahoo.com");

    // const newuser = await hardhatDatabase.addUser("1", owner.address, "udo", "udo@yahoo.com")
    // const ownerBalance = await hardhatToken.balanceOf(owner.address);
    // expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
    // console.log(await hardhatDatabase.addUser("5", "0x13F7C4C2AFc49e80F881d56B565aBAa94c3703Cd", "udo1", "ud1@yahoo.com"));
    // const event = tx.events.find(event => event.event === "UserAdded");
    // const [from, to, value] = event.args;
    // console.log(await hardhatDatabase.usercount());
    // console.log(from, to, value);
    // owners.forEach(owner => {
    //     console.log(owner.address);
    // });
    
    // console.log(await hardhatDatabase.callStatic.addUser("5", owner.address, "udo1", "ud1@yahoo.com"));
    // expect(await hardhatDatabase.check()).to.equal(true);
  });
});