/* ===== Persist data with LevelDB ==================
|  Learn more: level: https://github.com/Level/level |
/===================================================*/

const level = require('level');
const chainDB = './chaindata';

class LevelSandbox {

    constructor() {
        this.db = level(chainDB);
    }

    // Get data from levelDB with key (Promise)
    getLevelDBData(key) {
        let self = this;
        return new Promise(function (resolve, reject) {
            // Add your code here, remember in Promises you need to resolve() or reject()
            db.get(key, function (err, value) {
                if (err) return console.log('Not found!', err);
                console.log('Value = ' + value);
                resolve(value)
            })
        });
    }

    // Add data to levelDB with key and value (Promise)
    addLevelDBData(key, value) {
        let self = this;
        return new Promise(function (resolve, reject) {
            // Add your code here, remember in Promises you need to resolve() or reject() 
            let i = 0;
            db.createReadStream().on('data', function (data) {
                i++;
            }).on('error', function (err) {
                return console.log('Unable to read data stream!', err)
            }).on('close', function () {
                console.log('Block #' + i);
                resolve(addLevelDBData(i, value));
            });
        });
    }

    // Method that return the height
    getBlocksCount() {
        let self = this;
        return new Promise(function (resolve, reject) {
            // Add your code here, remember in Promises you need to resolve() or reject()
            let count = 0
            self.db.createKeyStream()
                .on('data', function (data) {
                    console.log('key=', data)
                    count++
                })
            resolve(count)
        });
    }


}

module.exports.LevelSandbox = LevelSandbox;
