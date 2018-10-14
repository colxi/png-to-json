# Png to JSON Parser
[![NoDependencies](https://img.shields.io/badge/dependencies-none-green.svg)](https://github.com/colxi/midi-parser-js)
[![Browser](https://img.shields.io/badge/browser-compatible-blue.svg)](https://github.com/colxi/midi-parser-js)
[![Node](https://img.shields.io/badge/node-compatible-brightgreen.svg)](https://www.npmjs.com/package/midi-parser-js)

Tiny library to parse Png files (or uint8Arrays containing Png data structures) into JSON human readable Objects. It extracts all the data from the IHDR chunk, and creates an array of chunks with it's relative byte blocks.

Accepts different data sources : 
- **HTML Input Elements** : Handles automatically the File change events (async)
- **File references** : From HTML Input Element (async)
- **Uint8Array** : Typed Array containing the data (sync)

Usage example (Node):
```javascript
    let fileData = fs.readFileSync('./test.png');
    let pngJSON = pngToJSON(fileData);
    console.log(pngJSON);
```


## Syntax

### Async modes (only browser) :

``` javascript
pngToJSON( HTMLInputElement, calback );
```

- **`HTMLInputElement`**: Reference to the DOM File Input Element
- **`callback`**: Function to receive the results of the conversion. It accepts two arguments :  `JSON PNG Object` and `Source File Info`.


``` javascript
pngToJSON( FileReference, calback )
```

- **`FileReference`**: Reference to the file returned from the File Input Element
- **`callback`**: Function to receive the results of the conversion. It accepts two arguments : `JSON PNG Object` and `Source File Info`.


### Sync mode (Node+browser):

``` javascript
pngToJSON( Uint8ArrayData )
```

- **`Uint8ArrayData`**:Uint8Array typed Array containing the png file data

**Returns** : JSON representation of the png file contents.

## JSON Structure

The returned JSON Object i strutured in thw following way (most keys are self explanatory)

```javascript
	pngJSON{
    	bitDepth: Integer,
        chunks: Integer, 				// total count
        colorType: Integer,
        colorTypeString: String, 		// string representation
        compressionMethod: Integer,
        data: Uint8Array[...], 			// png file data
        filterMethod: Integer,
        height: Integer,				// image height
        interlaceMethod: Integer,
        signature: Uint8Array[...],		// firat 8 bytes
        width: Integer,					// image width
        chunk: [
        	[0] : {
                data: Uint8Array[...], 	// chunk data block
                raw : Uint8Array[...],  // full chunk block
                id: Integer,
                isCritical: Boolean,
                isPublic: Boolean,
                chunkLength: Integer, 	// chunk length
                dataLength: Integer, 	// chunk data length
                offset: Integer, 		// chunk start offset
                type: String, 			// chunk type
            },
            [1] : {...},
            [2] : {...},
			(...)
        ]
    }
```   


**Note** : The resulting  `<pngJSON>.chunk[x].data` byteArrays, do not contain the the full chunk data. The bytes corresponding to the ` length block` , `type block`, and ` CRC block`, are stripped from it. **It only contains the `data block` from each chunk**. 

```
CHUNK BYTE STRUCTURE : 

<------------------------ chunk length -------------------------->
Chunk Offset                   Chunk Offset+8
├────────────────────┬────────────┼────────────────────────┬───────────┐
│ *DataLength (4b) │ Type (4b) │ Data (*DataLength b) │ CRC (4b) │
└────────────────────┴────────────┴────────────────────────┴───────────┘
<--------- stripped ----------->                      <-stripped->
```


Use  `<pngJSON>.chunk[x].raw`  instead, to get all the chunk data.

## Package distribution :

In browser enviroment you can include this library using the jsdelivr CDN ( window.pngToJSON() is created autmatically ) ...

```
<script src='https://cdn.jsdelivr.net/gh/colxi/png-to-json@latest/src/png-to-json.min.js'></script>
```

If you are in the NodeJs enviroment, can install the package via:

```
$ npm install png-to-json --save
```

The package can be imported using ES6 `import`  in Browser
```
import '<libraryPath>/src/png-to-json.js';
// window.pngToJSON() is created autmatically
```

## Licence 
GPL 3
