let fs = require('fs');
let pngToJSON = require('./../src/png-to-json.js');

// read the file...
let fileData = fs.readFileSync('./test.png');
// parse PNG ata to JSON
let json = pngToJSON(fileData);
// done! output !
console.log(json);
