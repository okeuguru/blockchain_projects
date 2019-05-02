const SHA256 = require('crypto-js/sha256');
const Block = require('../blockchain/Block.js');
const BlockChain = require('../blockchain/BlockChain.js');

//let myBlockChain = new BlockChain.Blockchain();

/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class BlockController {

  /**
   * Constructor to create a new BlockController, you need to initialize here all your endpoints
   * @param {*} app
   */
  constructor(app) {
    this.app = app;
    this.bc = new BlockChain.Blockchain();
    this.getBlockByIndex();
    this.postNewBlock();
  }

  /**
   * Implement a GET Endpoint to retrieve a block by index, url: "/api/block/:index"
   */
  getBlockByIndex() {
    let self = this.bc
    this.app.get("/block/:index", (req, res) => {

      // Get block function using getBlock(height) from BlockChain.js
      self.getBlock(req.params.index).then((block) => {
        block = block
        console.log(block)
        if (!block) return res.status(404).send('The block with the given height was not found.');

        res.send(block)
      }).catch((err) => { console.log(err); });

      //console.log(`This is the req block ${JSON.stringify(block)}`)
    });
  }
  /**
   * Implement a POST Endpoint to add a new Block, url: "/api/block"
   */
  postNewBlock() {

    let self = this.bc
    this.app.post("/block", (req, res) => {
      // Add your code here
      let block = new Block()

      // Get block height to append a new block
      self.getBlockHeight().then((height) => {

        // add block properties
        block.height = height + 1

        // Get body from post
        if (req.body.body) {
          block.body = req.body.body
          block.time = new Date().getTime().toString().slice(0, -3)
          block.hash = SHA256(JSON.stringify(block)).toString();

          // Get previous block hash
          self.getBlock(block.height - 1).then((prevblock) => {
            block.previousBlockHash = prevblock.hash

            // Validate block before adding to chain
            if (self.validateBlock(block.height)) {

              // Add block to chain
              self.addBlock(block)

              //send response 
              res.send(block);

              res.redirect('/blocks')

            }
          })
        } else {
          res.send("Body missing. Please add body to create block")
        }

      })
    });
  }
}

/**
 * Exporting the BlockController class
 * @param {*} app
 */
module.exports = (app) => { return new BlockController(app); }
