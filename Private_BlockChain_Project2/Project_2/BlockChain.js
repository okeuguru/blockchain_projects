/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

const SHA256 = require('crypto-js/sha256');
const LevelSandbox = require('./LevelSandbox.js');
const Block = require('./Block.js');

class Blockchain {

  constructor() {
    this.bd = new LevelSandbox.LevelSandbox();
    this.generateGenesisBlock();
  }

  // Helper method to create a Genesis Block (always with height= 0)
  // You have to options, because the method will always execute when you create your blockchain
  // you will need to set this up statically or instead you can verify if the height !== 0 then you
  // will not create the genesis block
  generateGenesisBlock() {
    let self = this;
    return new Promise((resolve, reject) => {
      resolve(new Block.Block("First block in the chain - Genesis block"))
    }).catch((err) => { console.log(err); reject(err) });
  }

  // Get block height, it is a helper method that return the height of the blockchain
  getBlockHeight() {
    let self = this;
    // block height
    return new Promise((resolve, reject) => {
      resolve(self.bd.getBlocksCount())
    }).catch((err) => { console.log(err); reject(err) });
  }

  // Add new block
  addBlock(block) {
    let self = this;
    return new Promise((resolve, reject) => {
      if (parseInt(self.bd.getLevelDBData('height')) !== 0) {
        self.generateGenesisBlock().then((result => {
          return result
        })).catch((err) => { console.log(err); reject(err) });
        block.previousBlockHash = ''
      }
      // previous block hash
      block.previousBlockHash = self.bd.getLevelDBData(self.bd.getBlocksCount() - 1).hash;

      // SHA256 requires a string of data
      self.getBlockHeight().then(function (result) {
        block.height = parseInt(result) + 1;
      });

      block.time = new Date().getTime().toString().slice(0, -3)
      block.hash = SHA256(JSON.stringify(block)).toString();
      // add block to chain
      self.bd.addDataToLevelDB(block).then((block) => {
        resolve(block)
      })
    }).catch((err) => { console.log(err); reject(err) });
  }
  // Get Block By Height
  getBlock(height) {
    let self = this;
    return new Promise((resolve, reject) => {
      resolve(getLevelDBData(height))
    }).catch((err) => { console.log(err); reject(err) });
  }

  // Validate if Block is being tampered by Block Height
  validateBlock(height) {
    let self = this;
    return new Promise((resolve, reject) => {
      // get block object
      let block = getBlock(height);
      // get block hash
      let blockHash = self.block.hash;
      // remove block hash to test block integrity
      block.hash = '';
      // generate block hash
      let validBlockHash = SHA256(JSON.stringify(block)).toString();
      // Compare
      if (blockHash === validBlockHash) {
        resolve(true)
      } else {
        console.log('Block #' + blockHeight + ' invalid hash:\n' + blockHash + '<>' + validBlockHash);
        resolve(false)
      }
    }).catch((err) => { console.log(err); reject(err) });
  }

  // Validate Blockchain
  validateChain() {
    let self = this;
    return new Promise((resolve, reject) => {
      let errorLog = [];
      for (var i = 0; i < self.bd.length - 1; i++) {
        // validate block
        if (!this.validateBlock(i)) errorLog.push(i);
        // compare blocks hash link
        let blockHash = self.bd[i].hash;
        let previousHash = self.bd[i + 1].previousBlockHash;
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
    }).catch((err) => { console.log(err); reject(err) });
  }

  // Utility Method to Tamper a Block for Test Validation
  // This method is for testing purpose
  _modifyBlock(height, block) {
    let self = this;
    return new Promise((resolve, reject) => {
      self.bd.addLevelDBData(height, JSON.stringify(block).toString()).then((blockModified) => {
        resolve(blockModified);
      }).catch((err) => { console.log(err); reject(err) });
    });
  }
}

module.exports.Blockchain = Blockchain;
