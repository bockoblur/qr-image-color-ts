// var Readable = require('stream').Readable;

import { QR, ECLevel } from "./qr-base.ts";

import * as png from "./png.ts";

import * as vector from "./vector.js";

import { parseColor } from "./parsecolor.ts";

import { QRDataType, QROptions } from "./qr-base.ts";

const BITMAP_OPTIONS: QROptions = {
  type: "png",
  parse_url: false,
  ec_level: "M",
  size: 5,
  margin: 4,
  //customize: null,
  //color: null,
  //background: null,
  transparent: false // default is false for bitmap to keep default behaviour
};

const VECTOR_OPTIONS: QROptions = {
  type: "svg",
  parse_url: false,
  ec_level: "M",
  margin: 1,
  size: 0,
  color: null,
  background: null,
  transparent: true // default is true for vector to keep default behaviour
};

function get_options(
  options: ECLevel | QROptions,
  force_type?: string
): QROptions {
  var opts: QROptions = { ...VECTOR_OPTIONS };

  if (typeof options === "string") {
    opts.ec_level = options;
  } else {
    opts = {
      ...opts,
      ...options,
      type: options.type.toLowerCase()
    } ;
  }
  if (force_type) opts.type = force_type.toLowerCase();

  if (opts.type == 'png' || force_type == 'png'){
    opts = {
      ...BITMAP_OPTIONS,
      ...opts,
    }
    opts.size = opts.size || 5;
    opts.margin = opts.margin || 1;
  }

  return opts as QROptions;
}

// function qr_image(text, options) {
//     options = get_options(options);

//     var matrix = QR(text, options.ec_level, options.parse_url);
//     var stream = new Readable();
//     stream._read = fn_noop;

//     var fore = colorParser(options.color, options.type);
//     var back = colorParser(options.background, options.type);

//     switch (options.type) {
//     case 'svg':
//     case 'pdf':
//     case 'eps':
//         process.nextTick(function() {
//             vector[options.type](matrix, stream, options.margin, options.size, fore, back, options.transparent);
//         });
//         break;
//     case 'svgpath':
//         // deprecated, use svg_object method
//         process.nextTick(function() {
//             var obj = vector.svg_object(matrix, options.margin, options.size);
//             stream.push(obj.path);
//             stream.push(null);
//         });
//         break;
// //    case 'png':
//     default:
//         throw new Error(`Invalid QR image type (${options.type}) requested`);
//         // process.nextTick(function() {
//         //     var bitmap = png.bitmap(matrix, options.size, options.margin);
//         //     if (options.customize) {
//         //         options.customize(bitmap);
//         //     }
//         //     png.png(bitmap, stream, fore, back, options.transparent);
//         // });
//     }

//     return stream;
// }

export function imageSync(text: QRDataType, options: ECLevel | QROptions) : string | Uint8Array {
  let opts = get_options(options);

  var matrix = QR(text, opts.ec_level, opts.parse_url);
  var outStr: string[] = [];

  var fore = parseColor(opts.color, opts.type);
  var back = parseColor(opts.background, opts.type);

  switch (opts.type) {
    case "svg":
    case "pdf":
    case "eps":
      vector[opts.type](
        matrix,
        outStr,
        opts.margin,
        opts.size,
        fore,
        back,
        opts.transparent
      );
      // result = outStr.join("");
      return outStr.join("");
      break;
    case 'png': 
      //@ts-ignore
    var bitmap = png.bitmap(matrix, opts.size, opts.margin);
    if (opts.customize) {
        opts.customize(bitmap);
    }
    //@ts-ignore
    return png.png(bitmap, fore, back, options.transparent);
    break;
    default:
      throw new Error(`Invalid QR image type (${opts.type}) requested`);
  }
}

export function svgObject(text: QRDataType, options: ECLevel | QROptions) {
  options = get_options(options, "svg");

  var matrix = QR(text, options.ec_level);
  return vector.SVG_object(matrix, options.margin);
}

// module.exports = {
//     matrix: QR,
//     image: qr_image,
//     imageSync: qr_image_sync,
//     svgObject: svg_object
// };