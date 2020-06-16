import { QRDataType } from "./qr-base.ts";

export interface QRMessage {
  data1?: number[];
  data10?: number[];
  data27?: number[];
}

function pushBits(arr: number[], n: number, value: number) {
  for (var bit = 1 << (n - 1); bit; bit = bit >>> 1) {
    arr.push(bit & value ? 1 : 0);
  }
}

// {{{1 8bit encode
function encode_8bit(data: Uint8Array) {
  var len = data.length;
  var bits: number[] = [];

  for (var i = 0; i < len; i++) {
    pushBits(bits, 8, data[i]);
  }

  var res: QRMessage = {};

  let d = [0, 1, 0, 0];
  pushBits(d, 16, len);
  res.data10 = res.data27 = d.concat(bits);

  if (len < 256) {
    let d = [0, 1, 0, 0];
    pushBits(d, 8, len);
    res.data1 = d.concat(bits);
  }

  return res;
}

// {{{1 alphanumeric encode
var ALPHANUM = ((s: string) => {
  var res = {};
  for (var i = 0; i < s.length; i++) {
    //@ts-ignore
    res[s[i]] = i;
  }
  return res;
})("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:");

function encode_alphanum(str: string) {
  var len = str.length;
  var bits: number[] = [];

  for (var i = 0; i < len; i += 2) {
    var b = 6;
    //@ts-ignore
    var n = ALPHANUM[str[i]];
    if (str[i + 1]) {
      b = 11;
      //@ts-ignore
      n = n * 45 + ALPHANUM[str[i + 1]];
    }
    pushBits(bits, b, n);
  }

  var res: QRMessage = {};

  var d = [0, 0, 1, 0];
  pushBits(d, 13, len);
  res.data27 = d.concat(bits);

  if (len < 2048) {
    let d = [0, 0, 1, 0];
    pushBits(d, 11, len);
    res.data10 = d.concat(bits);
  }

  if (len < 512) {
    let d = [0, 0, 1, 0];
    pushBits(d, 9, len);
    res.data1 = d.concat(bits);
  }

  return res;
}

// {{{1 numeric encode
function encode_numeric(str: string) {
  var len = str.length;
  var bits: number[] = [];

  for (var i = 0; i < len; i += 3) {
    var s = str.substr(i, 3);
    var b = Math.ceil((s.length * 10) / 3);
    pushBits(bits, b, parseInt(s, 10));
  }

  var res: QRMessage = {};

  var d = [0, 0, 0, 1];
  pushBits(d, 14, len);
  res.data27 = d.concat(bits);

  if (len < 4096) {
    let d = [0, 0, 0, 1];
    pushBits(d, 12, len);
    res.data10 = d.concat(bits);
  }

  if (len < 1024) {
    let d = [0, 0, 0, 1];
    pushBits(d, 10, len);
    res.data1 = d.concat(bits);
  }

  return res;
}

// {{{1 url encode
function encode_url(str: string) {
  var slash = str.indexOf("/", 8) + 1 || str.length;
  var res = encode(str.slice(0, slash).toUpperCase(), false);

  if (slash >= str.length) {
    return res;
  }

  var path_res = encode(str.slice(slash), false);

  if (res.data27 && path_res.data27) {
    res.data27 = res.data27.concat(path_res.data27);
  }

  if (res.data10 && path_res.data10) {
    res.data10 = res.data10.concat(path_res.data10);
  }

  if (res.data1 && path_res.data1) {
    res.data1 = res.data1.concat(path_res.data1);
  }

  return res;
}

// {{{1 Choose encode mode and generates struct with data for different version
export function encode(
  data: QRDataType,
  parse_url: boolean = false
): QRMessage {
  var str;
  var t = typeof data;

  if (t === "string" || t === "number") {
    str = "" + data;
    data = new TextEncoder().encode(str); // new Buffer.from(str);
  } else if (ArrayBuffer.isView(data)) {
    str = new TextDecoder().decode(data); // data.toString();
  } else if (Array.isArray(data)) {
    data = new Uint8Array(data); // Buffer.from(data);
    str = new TextDecoder().decode(data); // data.toString();
  } else {
    throw new Error("Bad data");
  }

  if (/^[0-9]+$/.test(str)) {
    if (data.length > 7089) {
      throw new Error("Too much data");
    }
    return encode_numeric(str);
  }

  if (/^[0-9A-Z $%*+./:-]+$/.test(str)) {
    if (data.length > 4296) {
      throw new Error("Too much data");
    }
    return encode_alphanum(str);
  }

  if (parse_url && /^https?:/i.test(str)) {
    return encode_url(str);
  }

  if (data.length > 2953) {
    throw new Error("Too much data");
  }
  return encode_8bit(data);
}
