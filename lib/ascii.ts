import { QR, QRDataType, ECLevel } from "./qr-base.ts";

function bigAscii(matrix: Uint8Array[]) {

  var res = "";
  matrix.forEach((e: Uint8Array) => {
    for (let i = 0; i < e.length; i++) {
      res += e[i] === 1 ? '██' : '  ';
    }
    res += "\n";
  });
  return res;
}

function smallAscii(matrix: Uint8Array[]) {

  var s = "";
  for (let i = 0; i < matrix.length - 1; i+=2) {
    for (let j = 0; j < matrix[i].length; j++) {
      let a = matrix[i][j];
      let b = a + matrix[i + 1][j];;
      if (b === 0) s += " ";
      else if (b === 2) s += "█";
      else if (a === 1) s += "▀";
      else s += "▄";
    }
    s += "\n";
  }
  // last row
  let i=matrix.length-1;
  for (let j = 0; j < matrix[i].length; j++) {
    s += matrix[i][j] ? "▀" : ' ';
  }
  return s + "\n";
}

export interface QRAsciiOptions {
  ec_level?: ECLevel;
  small?: boolean;
  encodeUrl?: boolean
}

export function asciiQR(data: QRDataType, options?: QRAsciiOptions){

    const defaultOpts : QRAsciiOptions = { 
      ec_level: 'M',
      small: false,
      encodeUrl: false
    }

    var opts = options || defaultOpts;
    var matrix = QR(data, opts.ec_level, opts.encodeUrl);

    return opts.small ? smallAscii(matrix) : bigAscii(matrix);
}