# Project #4. Connect Blockchain to Front-End Client with APIs

This is Project 3, Connect Blockchain to Front-End Client with APIs, in this project I created the classes to manage my private blockchain, to be able to persist my blochchain I used LevelDB. Data is loaded to LevelDB with simpleChain.js and app/BlockController.js is used to create the API end points and app/app.js is used to run the API

## Node Framework

Express.js was used as the API framework. The **GET Block Endpoint** and **POST Block Endpoint** were set up with express.js within the **BlockController.js** file

## Setup project for Review.

To setup the project for review do the following:

1. Download the project.
2. Run command **npm install** to install the project dependencies.
3. Run command **node simpleChain.js** in the root directory to populate LevelDB with 10 blocks
4. Run command **node app/app.js** in the root directory to listen on port **3001**

## BlockController.js

- **getBlockByIndex()**
- Implements the GET endpoint function used to retireve a block from LevelDB

- **postNewBlock()**
- Implements the POST endpoint function used to post a block to LevelDB

## app.js

- **BlockAPI**: Initializes the endpoint with is set up to listen on port 3001

## Test the API

The GET and POST API's can be tested using **Postman** or **curl**

**Postman**

- Download Postman specific to your OS from https://www.getpostman.com/downloads/. After download:

**GET**

1. Select GET
2. Enter URL http://localhost:8000/block/0 (for first block)
3. Click Send
4. Result should be returned

**Curl**

- To download Curl, go to https://curl.haxx.se/download.html. Curl can be used from command line to get data from the API. The command below can be used to GET block 0 data from API running on port 3001:
- `curl http://localhost:8000/block/0`

**POST**

1. Select POST
2. Enter URL http://localhost:8000/block
3. Select Body
4. Select JSON(application/json)
5. Enter JSON key/value pair with **body** as key: Example below
6. Click Send

**Example JSON for POST**

```
{
      "body": "Testing block with test string data"
}
```

**Curl**

- Curl can be used from command line to Post data to LevelDB via rest API. The command below can be used to POST data:
- `curl -H "Content-Type: application/json" -X POST -d '{"body": "Testing block with test string data"}' curl http://localhost:8000/block`

## Everything below this line is related to loading data into LevelDB

## --------------------------------------------------------------------------------

## Testing the data load

The test below below is related to setting up **simpleChain.js** and does not relate directly to the set up of the APIs

The file **simpleChain.js** in the root directory has all the code to be able to test the project, please review the comments in the file and uncomment the code to be able to test each feature implemented:

- Uncomment the function:

```
(function theLoop (i) {
	setTimeout(function () {
		let blockTest = new Block.Block("Test Block - " + (i + 1));
		myBlockChain.addNewBlock(blockTest).then((result) => {
			console.log(result);
			i++;
			if (i < 10) theLoop(i);
		});
	}, 1000);
  })(0);
```

The function above (theLoop) will create 10 test blocks in the chain.

- Uncomment the function

```
* Uncomment the function
```

setTimeout(function () {
myBlockChain.getBlock(0).then((block) => {
console.log(block)
}).catch((err) => { console.log(err); });
}, 1000)

```
This function get from the Blockchain the block requested.
* Uncomment the function
```

setTimeout(function () {
myBlockChain.validateBlock(0).then((valid) => {
console.log(valid);
})
.catch((error) => {
console.log(error);
})
}, 1500)

```
This function validate and show in the console if the block is valid or not, if you want to modify a block to test this function uncomment this code:
```

setTimeout(function () {
myBlockChain.getBlock(5).then((block) => {
let blockAux = block;
blockAux.body = "Tampered Block";
myBlockChain.\_modifyBlock(blockAux.height, blockAux).then((blockModified) => {
if (blockModified) {
myBlockChain.validateBlock(blockAux.height).then((valid) => {
console.log(`Block #${blockAux.height}, is valid? = ${valid}`);
})
.catch((error) => {
console.log(error);
})
} else {
console.log("The Block wasn't modified");
}
}).catch((err) => { console.log(err); });
}).catch((err) => { console.log(err); });
}, 12000)

setTimeout(function () {

myBlockChain.getBlock(6).then((block) => {
let blockAux = block;
blockAux.previousBlockHash = "jndininuud94j9i3j49dij9ijij39idj9oi";
myBlockChain.\_modifyBlock(blockAux.height, blockAux).then((blockModified) => {
if (blockModified) {
console.log("The Block was modified");
} else {
console.log("The Block wasn't modified");
}
}).catch((err) => { console.log(err); });
}).catch((err) => { console.log(err); });
}, 15000)

```
* Uncomment this function:
```

setTimeout(function () {
myBlockChain.validateChain().then((errorLog) => {
if (errorLog.length > 0) {
console.log("The chain is not valid:");
errorLog.forEach(error => {
console.log(error);
});
} else {
console.log("No errors found, The chain is Valid!");
}
})
.catch((error) => {
console.log(error);
})
}, 20000)

```

This function validates the whole chain and return a list of errors found during the validation.
setTimeout was used to ensure that the functions run in a particular order

## What do I learned with this Project

* I was able to identify the basic data model for a Blockchain application.
* I was able to use LevelDB to persist the Blockchain data.
* I was able to write algorithms for basic operations in the Blockchain.
```
