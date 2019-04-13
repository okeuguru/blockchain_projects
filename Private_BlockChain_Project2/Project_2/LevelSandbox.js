/* ===== Persist data with LevelDB ==================
|  Learn more: level: https://github.com/Level/level |
/===================================================*/
// Importing the module 'level'
const level = require('level');
// Declaring the folder path that store the data
const chainDB = './chaindata';
// Declaring a class
class LevelSandbox {
    // Declaring the class constructor
    constructor() {
        this.db = level(chainDB);
    }

    // Get data from levelDB with key (Promise)
    getLevelDBData(key) {
        let self = this; // because we are returning a promise we will need this to be able to reference 'this' inside the Promise constructor
        return new Promise(function (resolve, reject) {
            self.db.get(key, (err, value) => {
                //console.log(JSON.parse(value))
                if (err) {
                    if (err.type == 'NotFoundError') {
                        resolve(undefined);
                    } else {
                        console.log('Block ' + key + ' get failed', err);
                        reject(err);
                    }
                } else {
                    resolve(JSON.parse(value));
                }
            });
        }).catch((err) => { console.log(err); reject(err) });
    }

    // Add data to levelDB with key and value (Promise)
    addLevelDBData(key, value) {
        let self = this.db;
        return new Promise(function (resolve, reject) {
            self.put(key, value, function (err) {
                if (err) {
                    console.log('Block ' + key + ' submission failed', err);
                    reject(err);
                }
                resolve(value);
            });
        }).catch((err) => { console.log(err); reject(err) });
    }

    // Add data to levelDB with value
    addDataToLevelDB(value) {
        let self = this.db;
        let self2 = this;
        let i = 0;
        return new Promise(function (resolve, reject) {
            self.createReadStream().on('data', function (data) {
                i++;
            }).on('error', function (err) {
                return console.log('Unable to read data stream!', err)
            }).on('close', function () {
                console.log('Block #' + i);
                self2.addLevelDBData(i, value).then((result) => {
                    resolve(result)
                });
            });
        }).catch((err) => { console.log(err); reject(err) });
    }
    /**
    * Step 2. Implement the getBlocksCount() method
    */
    getBlocksCount() {
        let i = 0
        let self = this.db;
        // Add your code here
        return new Promise(function (resolve, reject) {
            self.createReadStream().on('data', function (data) {
                i++;
            }).on('error', function (err) {
                return console.log('Unable to read data stream!', err)
            }).on('close', function () {
                resolve(i)
            })
        }).catch((err) => { console.log(err); reject(err) });
    }
}
// Export the class
module.exports.LevelSandbox = LevelSandbox;