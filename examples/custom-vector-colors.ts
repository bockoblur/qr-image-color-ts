import {qrImage} from '../mod.ts';

var cmykLtGreen = [0.5, 0, 0.3, 0];            // 50% Cyan, 30% Yellow
var cmykWhite   = [0, 0, 0, 0];
var cmykDkBlue  = [1, 0.6, 0, 0.35];           // 100% Cyan, 60% Magenta, 35% Black
var cmykLtCoolGray   = [0.05, 0, 0, 0.07];     // 5% Cyan, 7% Black

var rgbGray = [64, 64, 64];

const write = (fname: string, data : string | Uint8Array) => {
    if (typeof data === 'string')
        Deno.writeTextFileSync(fname, data)
    else
        Deno.writeFileSync(fname, data)
}

var pdf = await qrImage("TEST Custom Color PDF", {type: 'pdf', color: cmykLtGreen, background: cmykWhite, transparent: false });

var eps= await qrImage("TEST Custom Color EPS", {type: 'eps' , color: cmykDkBlue, background: cmykLtCoolGray, transparent: false });

// For svg, any valid css string can be passed
// **Note: Illustrator and Inkscape do not play well with rgba(), hsv(), hsva() etc.
// If you need to open in those, use css name or #RRGGBB notation.
// If you want transparent background, just ommit 'background' property or set it to null.
var svg= await qrImage("TEST Custom Color SVG", {type: 'svg', color: "fuchsia", transparent: false });

var png= await qrImage("TEST Transparent PNG File", {type: 'png' });

write('test.pdf', pdf);
write('test.eps', eps);
write('test.svg', svg);
write('test.png', png);