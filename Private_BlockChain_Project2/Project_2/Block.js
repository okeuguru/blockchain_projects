/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block {
  constructor(data) {
    this.hash = "",
      this.height = 0,
      this.body = data,
      this.time = 0,
      this.previousBlockHash = ""
  }

  // toString() {
  //   return `Block -
  //     Timestamp          : ${this.time}
  //     Previous Block Hash: ${this.previousBlockHash.substring(0, 10)}
  //     Hash               : ${this.hash.substring(0, 10)}
  //     Data               : ${this.data}`;
  // }
}

module.exports.Block = Block;