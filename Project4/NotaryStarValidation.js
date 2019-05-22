const bitcoinMessage = require("bitcoinjs-message");

/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class NotaryStarValidation {
  /**
   * Constructor to create a new validation
   * @param {*} req
   */
  constructor(req) {
    this.req = req;
    this.mempool = [];
    this.mempoolValid = [];
  }

  isRequestValid(request) {
    let valid;
    this.mempoolValid.find(req => {
      if (req.status.address === request.status.address) {
        valid = true;
      } else {
        return false;
      }
    });
    return valid;
  }

  isBlockValid(block) {
    let valid;
    this.mempoolValid.find(req => {
      console.log("blockValid", block);
      if (
        req.registerStar === true &&
        req.status.address === block.body.address
      ) {
        valid = true;
      } else {
        valid === false;
      }
    });
    return valid;
  }
  async validateRequestByWallet(request) {
    let self = this;
    let validResponse;

    if (request) {
      self.mempool.find(req => {
        if (req.walletAddress === request.walletAddress) {
          if (req.validationWindow > 0) {
            let isValid = bitcoinMessage.verify(
              req.message,
              req.walletAddress,
              request.signature
            );
            if (isValid === true) {
              const TimeoutRequestsWindowTime = 5 * 60 * 1000;

              let timeElapse =
                new Date()
                  .getTime()
                  .toString()
                  .slice(0, -3) - req.requestTimeStamp;
              let timeLeft = TimeoutRequestsWindowTime / 1000 - timeElapse;
              req.validationWindow = timeLeft;
              validResponse = {
                registerStar: true,
                status: {
                  address: req.walletAddress,
                  requestTimeStamp: req.requestTimeStamp,
                  message: req.message,
                  validationWindow: req.validationWindow,
                  messageSignature: true
                }
              };
              self.mempoolValid.push(validResponse);
              console.log("Valid Mempool", self.mempoolValid);
            }
            //return validResponse;
          }
        } else {
          console.log("time expired");
          self.mempool = self.mempool.filter(
            item => item.walletAddress !== req.walletAddress
          );
        }
      });
    }
    return validResponse;
  }

  async validateRequestObject() {
    if (!this.req.body.address) {
      throw new Error("Fill the address parameter");
    }

    return true;
  }

  /**
   * Add request to mempo ol validation
   */

  async addRequestValidation(request) {
    let self = this;
    let reqIndex;
    let submittedReq;

    reqIndex = self.mempool.findIndex(
      x => x.walletAddress === request.walletAddress
    );

    if (self.mempool === undefined || self.mempool.length === 0) {
      self.mempool.push(request);
      return request;
    }
    if (self.mempool !== undefined || self.mempool.length > 0) {
      if (self.mempool[reqIndex].walletAddress === request.walletAddress) {
        const TimeoutRequestsWindowTime = 5 * 60 * 1000;

        submittedReq = self.mempool[reqIndex];

        let timeElapse =
          new Date()
            .getTime()
            .toString()
            .slice(0, -3) - submittedReq.requestTimeStamp;
        let timeLeft = TimeoutRequestsWindowTime / 1000 - timeElapse;
        submittedReq.validationWindow = timeLeft;

        if (submittedReq.validationWindow > 0) {
          self.mempool.splice(reqIndex, 1, submittedReq);
          return submittedReq;
        } else {
          return "Message expired";
        }

        // self.timeoutRequests[req.walletAddress] = setTimeout(function() {
        //   self.removeValidationRequest(req.walletAddress);
        // }, TimeoutRequestsWindowTime);
        //console.log(req);
      }

      // if (req.walletAddress === request.walletAddress) {
      //   console.log("Added object has already been submited");
      //   console.log(self.mempool);
      //   console.log(req);
    }
  }
}

//   async addRequestValidation(request) {
//     let self = this;
//     let reqIndex;
//     reqIndex = self.mempool.findIndex(
//       x => x.walletAddress === request.walletAddress
//     );
//     console.log(reqIndex);
//     if (request) {
//       if (self.mempool === undefined || self.mempool.length === 0) {
//         self.mempool.push(request);
//         return request;
//       } else {
//         self.mempool.find(req => {
//           if (req.walletAddress === request.walletAddress) {
//             const TimeoutRequestsWindowTime = 5 * 60 * 1000;

//             let timeElapse =
//               new Date()
//                 .getTime()
//                 .toString()
//                 .slice(0, -3) - req.requestTimeStamp;
//             let timeLeft = TimeoutRequestsWindowTime / 1000 - timeElapse;
//             req.validationWindow = timeLeft;

//             return req;

//             // self.timeoutRequests[req.walletAddress] = setTimeout(function() {
//             //   self.removeValidationRequest(req.walletAddress);
//             // }, TimeoutRequestsWindowTime);
//             //console.log(req);
//           } else if (req.walletAddress !== request.walletAddress) {
//             self.mempool.push(request);
//           }

//           // if (req.walletAddress === request.walletAddress) {
//           //   console.log("Added object has already been submited");
//           //   console.log(self.mempool);
//           //   console.log(req);
//         });
//       }
//     }
//   }
// }
module.exports = NotaryStarValidation;
