/*
* @Author: colxi
* @Date:   2018-10-09 19:21:36
* @Last Modified by:   colxi
* @Last Modified time: 2018-10-13 19:57:55
*/

(function(){

    /**
     * mbv() multi-byte value extractor
     * @param  {[type]}  a            [uint8 array]
     * @param  {[type]}  o            [offset]
     * @param  {[type]}  l            [length]
     * @param  {Boolean} littleEndian [islittleEndian]
     *
     * @return {[type]}               [hex representaion]
     */
    function mbv(a,o,l){
        let v=0;
        for(let i=0; i<l-1; i++) v+= a[o+i] << (8* (l-i-1) );
        return v+a[o+(l-1)];
    }

    /**
     * pngToJSON() : Hanldes multiple data souces]
     * @param  {[type]}   source   [description]
     * @param  {Function} callback [description]
     *
     * @return {[type]}            [description]
     */
    function pngToJSON(source,callback){
        // uint8array
        if(source instanceof Uint8Array){
            return _pngToJSON(source);
        }
        // input element (async)
        else if(typeof HTMLElement !== 'undefined' && source instanceof HTMLElement && source.tagName==='INPUT' && source.type==='file'){
            if(typeof callback !== 'function') throw new Error('pngToJSON() : Callback function expected in second argument');
            source.addEventListener('change', e=>{
                const reader = new FileReader();
                const file   = e.target.files[0];
                reader.onload = () => callback( _pngToJSON( new Uint8Array(reader.result) ), file );
                reader.readAsArrayBuffer(file);
            });
        }
        // File reference (from IFile Input element (async<9
        else if(typeof File !== 'undefined' && source instanceof File){
            if(typeof callback !== 'function') throw new Error('pngToJSON() : Callback function expected in second argument');
            const reader = new FileReader();
            const file   = source;
            reader.onload = () => callback( _pngToJSON( new Uint8Array(reader.result) ), file );
            reader.readAsArrayBuffer(file);
        }
        // Not supported error
        else throw new Error('pngToJSON() : Source type not supported ( Allowed: Uint8Array, File Reference, Input Element )');
    }

    /**
     * _pngToJSON description() : Convert Uint8Array to JSON
     * @param  {[type]} imgData [Uint8Array containing the image data]
     *
     * @return {[type]}         [JSON object]
     */
    function _pngToJSON(imgData){
        let png     = {};
        png.chunk   = [];
        png.data    = imgData;

        // block if it's not a valid png (signature check)
        let standardSignature = [137, 80, 78 ,71, 13, 10, 26, 10];
        png.signature = new Uint8Array(imgData.buffer,0,8);
        if( !standardSignature.every((value, index) => value === png.signature[index]) ){
            throw new Error('pngToJSON() : Invalid PNG file!. (Not matching signature)');
        }

        // start in offset 8 (after bytearray signature)
        let offset=8;
        let chunkCount=0;
        while(true){
            // set the properties of the chunk
            let chunk={};
            png.chunk[ chunkCount ] = chunk;
            chunk.id = chunkCount;
            chunk.dataLength = mbv(png.data,offset,4);  // length of the data block
            chunk.chunkLength = chunk.dataLength+4+4+4; // DataLength + LenghtBlock + TypeBlock + CRCBlock
            chunk.offset = offset;                      // chunk start offset
            chunk.raw = new Uint8Array(imgData.buffer, chunk.offset, chunk.chunkLength );
            chunk.type= String.fromCharCode( png.data[offset+4] )+
                String.fromCharCode( png.data[offset+5] )+
                String.fromCharCode( png.data[offset+6] )+
                String.fromCharCode( png.data[offset+7] );
            let firstChar = String.fromCharCode( png.data[offset+4] );
            chunk.isCritical = firstChar === firstChar.toUpperCase()  ? true : false;
            let secondChar= String.fromCharCode( png.data[offset+5] );
            chunk.isPublic = secondChar === secondChar.toUpperCase()  ? true : false;
            // set a new view for the chunk
            chunk.data = new Uint8Array(imgData.buffer, chunk.offset+4+4, chunk.dataLength );
            // increase the offset (4 bytes the length block + 4 bytes the type block +
            // 4 bytes the verification block + <length> bytes the data block
            offset+=chunk.chunkLength;
            // increase chunk counter
            chunkCount++;
            // if end of file is reached break looo
            if(offset >= png.data.byteLength) break;
        }

        // extract and set image metadata from chunk 1 (IHDR)
        const colorType = {
            '0' : 'grayscale',
            '2' : 'truecolor',
            '3' : 'indexed color',
            '4' : 'grayscale+alpha',
            '6' : 'truecolor+alpha'
        };

        png.width             = mbv( png.chunk[0].data,0,4 );
        png.height            = mbv( png.chunk[0].data,4,4 );
        png.chunks            = Array.from(png.chunk).length;
        png.bitDepth          = png.chunk[0].data[8];
        png.colorType         = png.chunk[0].data[9];
        png.compressionMethod = png.chunk[0].data[10];
        png.filterMethod      = png.chunk[0].data[11];
        png.interlaceMethod   = png.chunk[0].data[12];
        png.colorTypeString   = colorType[ png.colorType ];

        // done!
        return png;
    }

    if (typeof module !== 'undefined' && module.exports) module.exports = pngToJSON;
    else window.pngToJSON = pngToJSON;

})();
