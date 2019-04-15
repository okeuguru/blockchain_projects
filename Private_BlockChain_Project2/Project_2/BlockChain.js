/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

const SHA256 = require('crypto-js/sha256');
const LevelSandbox = require('./LevelSandbox.js');
const Block = require('./Block.js');

class Blockchain {

  constructor() {
    this.bd = new LevelSandbox.LevelSandbox();
    this.generateGenesisBlock()
  }

  // Helper method to create a Genesis Block (always with height= 0)
  // You have to options, because the method will always execute when you create your blockchain
  // you will need to set this up statically or instead you can verify if the height !== 0 then you
  // will not create the genesis block
  generateGenesisBlock() {
    let self = this;
    let self2 = this.bd;
    let block

    return new Promise((resolve, reject) => {

      block = new Block.Block("First block in the chain - Genesis block")
      block.time = new Date().getTime().toString().slice(0, -3)
      block.hash = SHA256(JSON.stringify(block)).toString();
      block.height = 0
      self2.addDataToLevelDB(JSON.stringify(block)).then((result) => {
        //console.log(JSON.parse(result))
        resolve(result)
      })
    }).catch((err) => { console.log(err); reject(err) });
  }

  // Get block height, it is a helper method that return the height of the blockchain
  async getBlockHeight() {
    let self = this;
    let blockHeight
    // block height
    blockHeight = await self.bd.getBlocksCount()
    return blockHeight
  }

  // Add new block
  async addBlock(block) {
    let self = this;
    let self2 = this.bd
    let previousBlock
    let blockHeight
    let block2Add

    // SHA256 requires a string of data
    blockHeight = await self.getBlockHeight()
    block.height = blockHeight
    block.time = new Date().getTime().toString().slice(0, -3)

    if (block.height > 0) {

      // previous block hash
      previousBlock = await self.getBlock(block.height - 1)
      block.previousBlockHash = previousBlock.hash

      block.hash = SHA256(JSON.stringify(block)).toString();

      // add block to chain
      block2Add = await self2.addDataToLevelDB(JSON.stringify(block))
      return JSON.stringify(block2Add).toString()
    }
  }

  // Get Block By Height
  async getBlock(height) {
    let self = this
    let self2 = this.bd;
    let blockHeight
    let block

    blockHeight = await self.getBlockHeight()
    block = await self2.getLevelDBData(height)
    return block
  }

  // Validate if Block is being tampered by Block Height
  async validateBlock(height) {
    let self = this;
    let validBlock

    // get block object
    validBlock = await self.getBlock(height)

    // get block hash
    let blockHash = validBlock.hash

    // remove block hash to test block integrity
    validBlock.hash = ''

    // generate block hash
    let validBlockHash = SHA256(JSON.stringify(validBlock)).toString()

    // Compare
    if (blockHash === validBlockHash) {
      return true
    } else {
      console.log('Block #' + blockHeight + ' invalid hash:\n' + blockHash + '<>' + validBlockHash);
      return false
    }
  }

  // Validate Blockchain
  validateChain() {
    let self = this;
    return new Promise((resolve, reject) => {
      let errorLog = [];
      let chainLength

      self.getBlockHeight().then((result) => {
        chainLength = result
        console.log(`This is cl ${chainLength}`)

        for (var i = 0; i < chainLength - 1; i++) {
          // validate block
          if (!this.validateBlock(i)) errorLog.push(i);
          // compare blocks hash link
          let blockHash = getBlock(i).hash;
          let previousHash = getBlock(i + 1).previousBlockHash;
          if (blockHash !== previousHash) {
            errorLog.push(i);
          }
        }
        if (errorLog.length > 0) {
          console.log('Block errors = ' + errorLog.length);
          console.log('Blocks: ' + errorLog);
        } else {
          console.log('No errors detected');
        }
      })
    }).catch((err) => { console.log(err); reject(err) });
  }

  // Utility Method to Tamper a Block for Test Validation
  // This method is for testing purpose
  _modifyBlock(height, block) {
    let self = this;
    return new Promise((resolve, reject) => {
      self.bd.addLevelDBData(height, JSON.stringify(block).toString()).then((blockModified) => {
        resolve(blockModified);
      })
    }).catch((err) => { console.log(err); reject(err) });
  }
}

module.exports.Blockchain = Blockchain;