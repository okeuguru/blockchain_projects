const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract("StarNotary", accs => {
  accounts = accs;
  owner = accounts[0];
});

it("can Create a Star", async () => {
  let tokenId = 32;
  let instance = await StarNotary.deployed();
  await instance.createStar("Awesome Star!", tokenId, { from: accounts[0] });
  assert.equal(await instance.tokenIdToStarInfo.call(tokenId), "Awesome Star!");
});

it("lets user1 put up their star for sale", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let starId = 2;
  let starPrice = web3.utils.toWei(".01", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it("lets user1 get the funds after the sale", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 3;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
  await instance.buyStar(starId, { from: user2, value: balance });
  let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
  let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
  let value2 = Number(balanceOfUser1AfterTransaction);
  assert.equal(value1, value2);
});

it("lets user2 buy a star, if it is put up for sale", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 4;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
  await instance.buyStar(starId, { from: user2, value: balance });
  assert.equal(await instance.ownerOf.call(starId), user2);
});

it("lets user2 buy a star and decreases its balance in ether", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 5;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
  const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
  await instance.buyStar(starId, { from: user2, value: balance, gasPrice: 0 });
  const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
  let value =
    Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
  assert.equal(value, starPrice);
});

//Add star Name

it("can add the star name and star symbol properly", async () => {
  let tokenId = 35;
  let instance = await StarNotary.deployed();

  // 1. create a Star with different tokenId
  await instance.createStar("Guru Star Token", tokenId, { from: accounts[0] });

  // 2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
  let tokenName = await instance.name();
  let tokenSymbol = await instance.symbol();

  assert.equal(tokenName, "Guru Star Token");
  assert.equal(tokenSymbol, "NUO");
});

it("lets 2 users exchange stars", async () => {
  let tokenId1 = 0;
  let tokenId2 = 1;
  let instance = await StarNotary.deployed();
  let user1 = accounts[0];
  let user2 = accounts[1];

  // 1. create 2 Stars with different tokenId for testing
  await instance.createStar("Star 10", tokenId1, { from: user1 });
  await instance.createStar("Star 20", tokenId2, { from: user2 });

  // 2. Exchange stars between created tokens
  await instance.exchangeStars(tokenId1, tokenId2, { from: user1 });

  // 3. Verify that the owners changed
  assert.equal(await instance.ownerOf(tokenId1), user2);
  assert.equal(await instance.ownerOf(tokenId2), user1);
});

it("lets a user transfer a star", async () => {
  let tokenId = 33;
  let instance = await StarNotary.deployed();
  let toUser = accounts[1];

  // 1. Different token ID
  await instance.createStar("Guru Star", tokenId, { from: accounts[0] });

  // 2. transfer Star Func
  await instance.transferStar(toUser, tokenId, { from: accounts[0] });

  // 3. Test change in ownership
  assert.equal(await instance.ownerOf(tokenId), toUser);
});

it("lookUptokenIdToStarInfo test", async () => {
  let tokenId = 18;
  let instance = await StarNotary.deployed();

  // 1. create a Star with a different tokenId
  await instance.createStar("Guru Star diff", tokenId, { from: accounts[1] });

  // 2. Call the ookUptokenIdToStarInfo function
  let name = await instance.lookUptokenIdToStarInfo(tokenId, {
    from: accounts[1]
  });

  // 3. Verify
  assert.equal(name, "Guru Star diff");
});
