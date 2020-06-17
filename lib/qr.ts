// var Readable = require('stream').Readable;

import { QR, ECLevel } from "./qr-base.ts";

import * as png from "./png.ts";

import * as vector from "./vector.js";

import { parseColor } from "./parsecolor.ts";

import { QRDataType, QROptions } from "./qr-base.ts";

import {get_options, DEFAULT_TYPE} from './get-options.ts';

async function qr_image(
  text: QRDataType,
  options: ECLevel | QROptions,
): Promise<string | Uint8Array> {

  var bytes : Uint8Array | null = null;
  var outStr: string[] = [];

  var opts = get_options(options);

  var matrix = QR(text, opts.ec_level, opts.parse_url);

  var fore = parseColor(opts.color, opts.type);
  var back = parseColor(opts.background, opts.type);

  switch (opts.type) {
    case "svg":
    case "pdf":
    case "eps":
      outStr = await Promise.resolve().then( function () {
        //@ts-ignore
        vector[opts.type](
          matrix,
          outStr,
          opts.margin,
          opts.size,
          fore,
          back,
          opts.transparent,
        );
        return outStr;
      });
      break;
    case "png":
      bytes = await Promise.resolve().then( function () {
        //@ts-ignore
        var bitmap = png.bitmap(matrix, opts.size, opts.margin);
        if (opts.customize) {
          opts.customize(bitmap);
        }
        //@ts-ignore
        return png.png(bitmap, fore, back, opts.transparent);
      });
      break;
    default:
      throw new Error(`Invalid QR image type (${opts.type}) requested`);
  }

  return  bytes || outStr.join("");
}

function qr_image_sync(
  text: QRDataType,
  options: ECLevel | QROptions,
): string | Uint8Array {
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
        opts.transparent,
      );
      return outStr.join("");
      break;
    case "png":
      //@ts-ignore
      var bitmap = png.bitmap(matrix, opts.size, opts.margin);
      if (opts.customize) {
        opts.customize(bitmap);
      }
      //@ts-ignore
      return png.png(bitmap, fore, back, opts.transparent);
      break;
    default:
      throw new Error(`Invalid QR image type (${opts.type}) requested`);
  }
}

function svg_object(text: QRDataType, options: ECLevel | QROptions) {
  options = get_options(options, "svg");

  var matrix = QR(text, options.ec_level);
  return vector.SVG_object(matrix, options.margin);
}

export {
  svg_object as svgObject,
  qr_image_sync as imageSync,
  QR as matrix,
  qr_image as image,
};
