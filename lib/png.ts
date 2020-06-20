//var zlib = require('zlib');
import {deflate} from '../deps.ts';
import {crc32} from './crc32.ts';

function writeUInt32BE(buf : Uint8Array, value: number, byteOffset: number){
    if (!buf || byteOffset <0 || byteOffset > buf.byteLength - 4)
        throw 'byteOffset out of range';
    value &= 0xffffffff;
    buf[byteOffset + 3] = value & 0xff;
    value = value >>> 8;
    buf[byteOffset + 2] = value  & 0xff;
    value = value >>> 8;
    buf[byteOffset + 1] = value  & 0xff;
    value = value >>> 8;
    buf[byteOffset] = value  & 0xff;
}

function concatBuff(buffers : Uint8Array[]) : Uint8Array {
    if (!buffers) return new Uint8Array(0);
    let totalLen = 0;
    for (let i = 0; i < buffers.length; i++) {
        totalLen += buffers[i].length;
    }
    let res = new Uint8Array(totalLen);
    res.set(buffers[0],0);
    let pos = buffers[0].length;
    for (let i = 1; i < buffers.length; i++) {
        res.set(buffers[i], pos);
        pos += buffers[i].length;
    }
    return res;
}
var PNG_HEAD  = Uint8Array.from([137,80,78,71,13,10,26,10]);
var PNG_IHDR  = Uint8Array.from([0,0,0,13,73,72,68,82,0,0,0,0,0,0,0,0,8,3,0,0,0,0,0,0,0]);  // PNG_IHDR[17] = 3, meaning Index color
var PNG_IDAT  = Uint8Array.from([0,0,0,0,73,68,65,84]);
var PNG_IEND  = Uint8Array.from([0,0,0,0,73,69,78,68,174,66,96,130]);

// Palette chunk for indexed color image. 
// PNG_PLTE[8,9,10] = R,G,B of color #0 (Foreground); default = [0,0,0] i.e. black
// PNG_PLTE[11,12,13] = R,G,B of color #1 (Background) default = [255,255,255] i.e. white
var PNG_PLTE  = Uint8Array.from([0,0,0,6,0x50,0x4c,0x54,0x45,0,0,0,255,255,255,0,0,0,0]);

// Transparency chunk for indexed color image.
// PNG_tRNS[8]=transparency of color #0
// PNG_tRNS[9]=transparency of color #1
var PNG_tRNS  = Uint8Array.from([0,0,0,2,0x74,0x52,0x4e,0x53,0xff,0x00,0,0,0,0]);

interface BitmapDef{
    data: Uint8Array;
    size: number;
}

export function png(bitmap:BitmapDef, foreColor:Uint8Array, backColor:Uint8Array, transparent:boolean) : Uint8Array {
    
    var res : Uint8Array[] = [];

    res.push(PNG_HEAD);

    var IHDR = new Uint8Array(PNG_IHDR);
    writeUInt32BE(IHDR, bitmap.size, 8);
    writeUInt32BE(IHDR, bitmap.size, 12);
    writeUInt32BE(IHDR, crc32(IHDR.slice(4, -4)), 21);
    res.push(IHDR);

    // Pallete chunk
    var PLTE = new Uint8Array(PNG_PLTE); // Buffer.concat([PNG_PLTE]);
    if (foreColor && foreColor.length === 3){
        PLTE[8]  = foreColor[0];
        PLTE[9]  = foreColor[1];
        PLTE[10] = foreColor[2];
    } // foreColor.copy(PLTE,  8);

    if (backColor && backColor.length === 3){
        PLTE[11] = backColor[0];
        PLTE[12] = backColor[1];
        PLTE[13] = backColor[2];
    } // backColor.copy(PLTE, 11);
    writeUInt32BE(PLTE, crc32(PLTE.slice(4, -4)), PLTE.length - 4);
    res.push(PLTE);

    if (transparent){
        var tRNS = new Uint8Array(PNG_tRNS); // Buffer.concat([PNG_tRNS]);
        writeUInt32BE(tRNS, crc32(tRNS.slice(4, -4)), tRNS.length - 4);
        res.push(tRNS);
    }

    // var IDAT = Buffer.concat([
    //     PNG_IDAT,
    //     zlib.deflateSync(bitmap.data, { level: 9 }),
    //     new Uint8Array(4) //new Buffer.alloc(4)
    // ]);


    var deflatedData = <Uint8Array>deflate(bitmap.data, {level: 9});

    var IDAT = concatBuff([
        PNG_IDAT, 
        deflatedData, 
        new Uint8Array(4)
    ]);

    writeUInt32BE(IDAT, IDAT.length - 12, 0);
    writeUInt32BE(IDAT, crc32(IDAT.slice(4, -4)), IDAT.length - 4);
    res.push(IDAT);

    res.push(PNG_IEND);
    return concatBuff(res);
}

export function bitmap(matrix:Uint8Array[], size:number, margin:number) : BitmapDef{
    var N = matrix.length;
    var X = (N + 2 * margin) * size;
    var data = new Uint8Array((X + 1) * X); // new Buffer.alloc((X + 1) * X);
    data.fill(1);   // We are writing color INDEX now, not gray value! (Was: data.fill(255); )
    for (var i = 0; i < X; i++) {
        data[i * (X + 1)] = 0;
    }

    for (var i = 0; i < N; i++) {
        for (var j = 0; j < N; j++) {
            if (matrix[i][j]) {
                var offset = ((margin + i) * (X + 1) + (margin + j)) * size + 1;
                data.fill(0, offset, offset + size);
                for (var c = 1; c < size; c++) {
                    // WAS (for Buffer): data.copy(data, offset + c * (X + 1), offset, offset + size);
                    data.copyWithin(offset + c * (X + 1), offset, offset+size);
                }
            }
        }
    }

    return {
        data: data,
        size: X
    }
}

// module.exports = {
//     bitmap: bitmap,
//     png: png
// }
