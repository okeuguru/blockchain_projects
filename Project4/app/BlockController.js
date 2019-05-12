const SHA256 = require("crypto-js/sha256");
const Block = require("../blockchain/Block.js");
const BlockChain = require("../blockchain/BlockChain.js");

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
    this.getBlockByHash();
    this.getBlockByAddress();
    this.validateRequest();
  }

  /**
   * Add request to mempool validation
   */

  async AddRequestValidation(obj) {
    let self = this;
    self.mempool = [];
    self.timeoutRequests = [];

    console.log(`MEMPOOL ${self.mempool} END`);

    for (let i of self.mempool) {
      if (i === obj) {
        console.log("Added object has already been submited");
      }
      let objAdd = await obj;

      const TimeoutRequestsWindowTime = 5 * 60 * 1000;

      let timeElapse =
        new Date()
          .getTime()
          .toString()
          .slice(0, -3) - objAdd.requestTimeStamp;
      let timeLeft = TimeoutRequestsWindowTime / 1000 - timeElapse;
      objAdd.validationWindow = timeLeft;

      console.log(timeLeft);

      self.timeoutRequests[objAdd.walletAddress] = setTimeout(function() {
        self.removeValidationRequest(objAdd.walletAddress);
      }, TimeoutRequestsWindowTime);
      self.mempool.push(objAdd);
    }
  }

  /**
   * Implement a POST endpoint to validate request with JSON response
   */

  validateRequest() {
    let self = this;

    let request;
    self.app.post("/requestValidation/:address", (req, res) => {
      request = {
        walletAddress: req.params.address
      };
      (request.requestTimeStamp = new Date()
        .getTime()
        .toString()
        .slice(0, -3)),
        (request.message = `${request.walletAddress}:${
          request.requestTimeStamp
        }:starRegistry`),
        (request.validationWindow = 300);
      res.send(request);

      self.AddRequestValidation(request);
      //console.log(request);
    });
  }

  /**
   * Implement a GET Endpoint to retrieve a block by index, url: "/api/block/:index"
   */
  getBlockByAddress() {
    let self = this.bc;
    let parsedArray = [];
    this.app.get("/stars/address/:address", (req, res) => {
      // Get block function using getBlockAddress(address) from BlockChain.js
      // This returns an array
      // The array will be parsed to decode stars in individual blocks
      // parsed blocks will be pushed back into an array and sent to API
      self
        .getBlockAddress(req.params.address)
        .then(blockArray => {
          blockArray.map(block => {
            // parse block
            let parsedBlock = JSON.parse(block);

            // decode star and add decoded star to the parsed block
            parsedBlock.body.star["storyDecoded"] = new Buffer.from(
              parsedBlock.body.star.story,
              "hex"
            ).toString();

            // make sure block exists
            if (!parsedBlock)
              return res
                .status(404)
                .send("The block with the given hash was not found.");
            parsedArray.push(parsedBlock);
          });
          res.send(parsedArray);
        })
        .catch(err => {
          console.log(err);
        });

      //console.log(`This is the req block ${JSON.stringify(block)}`)
    });
  }

  /**
   * Implement a GET Endpoint to retrieve a block by index, url: "/api/block/:index"
   */
  getBlockByHash() {
    let self = this.bc;
    this.app.get("/stars/hash/:hash", (req, res) => {
      // Get block function using getBlockHash(hash) from BlockChain.js
      self
        .getBlockHash(req.params.hash)
        .then(block => {
          block = block;

          // parse block
          let parsedBlock = JSON.parse(block);

          // decode star and add decoded star to the parsed block
          parsedBlock.body.star["storyDecoded"] = new Buffer.from(
            parsedBlock.body.star.story,
            "hex"
          ).toString();

          // make sure block exists
          if (!block)
            return res
              .status(404)
              .send("The block with the given hash was not found.");

          res.send(parsedBlock);
        })
        .catch(err => {
          console.log(err);
        });

      //console.log(`This is the req block ${JSON.stringify(block)}`)
    });
  }

  /**
   * Implement a GET Endpoint to retrieve a block by index, url: "/api/block/:index"
   */
  getBlockByIndex() {
    let self = this.bc;
    this.app.get("/block/:index", (req, res) => {
      // Get block function using getBlock(height) from BlockChain.js
      self
        .getBlock(req.params.index.toString())
        .then(block => {
          block = block;
          console.log(block);
          if (!block)
            return res
              .status(404)
              .send("The block with the given height was not found.");

          res.send(block);
        })
        .catch(err => {
          console.log(err);
        });

      //console.log(`This is the req block ${JSON.stringify(block)}`)
    });
  }

  /**
   * Implement a POST Endpoint to add a new Block, url: "/api/block"
   */
  postNewBlock() {
    let self = this.bc;
    this.app.post("/block", (req, res) => {
      let block = new Block();

      // Get block height to append a new block
      self
        .getBlockHeight()
        .then(height => {
          // add block properties
          block.height = height + 1;

          // Get body from post
          if (req.body.body) {
            block.body = {
              address: req.body.body.address,
              star: {
                ra: req.body.body.star.ra,
                dec: req.body.body.star.dec,
                mag: req.body.body.star.mag,
                cen: req.body.body.star.cen,
                story: Buffer.from(req.body.body.star.story).toString("hex")
              }
            };
            block.time = new Date()
              .getTime()
              .toString()
              .slice(0, -3);
            block.hash = SHA256(JSON.stringify(block)).toString();

            // Get previous block hash
            self
              .getBlock(block.height - 1)
              .then(prevblock => {
                block.previousBlockHash = prevblock.hash;

                // Validate block before adding to chain
                if (self.validateBlock(block.height)) {
                  // Add block to chain
                  self.addBlock(block);

                  //send response
                  res.send(block);
                }
              })
              .catch(err => {
                console.log(err);
                reject(err);
              });
          } else {
            res.send("Body missing. Please add body to create block");
          }
        })
        .catch(err => {
          console.log(err);
          reject(err);
        });
    });
  }
}

/**
 * Exporting the BlockController class
 * @param {*} app
 */
module.exports = app => {
  return new BlockController(app);
};
