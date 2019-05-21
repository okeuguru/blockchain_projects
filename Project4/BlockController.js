const SHA256 = require("crypto-js/sha256");
const Block = require("./blockchain/Block.js");
const BlockChain = require("./blockchain/BlockChain.js");
const NotaryStarValidation = require("./NotaryStarValidation.js");

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
    this.NotaryStarValidation = new NotaryStarValidation();
    this.getBlockByIndex();
    this.postNewBlock();
    this.getBlockByHash();
    this.getBlockByAddress();
    this.validateRequest();
    this.validateSignature();
  }

  validateSignature() {
    let self = this;

    let request;
    self.app.post("/message-signature/validate/", async (req, res) => {
      request = {
        walletAddress: req.body.address,
        signature: req.body.signature
      };

      self.NotaryStarValidation.validateRequestByWallet(request).then(
        request => {
          res.send(request);
        }
      );
    });
  }

  /**
   * Implement a POST endpoint to validate request with JSON response
   */

  validateRequest() {
    let self = this;
    let validatedRequest;

    let request;
    self.app.post("/requestValidation/", async (req, res) => {
      request = {
        walletAddress: req.body.address
      };
      (request.requestTimeStamp = new Date()
        .getTime()
        .toString()
        .slice(0, -3)),
        (request.message = `${request.walletAddress}:${
          request.requestTimeStamp
        }:starRegistry`),
        (request.validationWindow = 300);
      //self.NotaryStarValidation.mempool.push(request);

      self.NotaryStarValidation.addRequestValidation(request).then(result => {
        console.log(result);
        res.send(result);
        //   self.NotaryStarValidation.mempool.find(obj => {
        //     if (obj.walletAddress === result.walletAddress) {
        //       res.send(obj);
        //     }
        //   });
        // });
      });
      // .catch(err => {
      //   console.log(err);
      //   res.send("Already added");
      // });
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
            if (isRequestValid(request)) {
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
            }
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
          block.body.star["storyDecoded"] = new Buffer.from(
            block.body.star.story,
            "hex"
          ).toString();
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
          if (req.body) {
            block.body = {
              address: req.body.address,
              star: {
                ra: req.body.star.ra,
                dec: req.body.star.dec,
                mag: req.body.star.mag,
                cen: req.body.star.cen,
                story: Buffer.from(req.body.star.story).toString("hex")
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

                  console.log(block.body);

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
