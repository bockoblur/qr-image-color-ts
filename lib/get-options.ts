import {ECLevel, QROptions} from './qr-base.ts';

export const DEFAULT_TYPE = 'png';

const BITMAP_OPTIONS: QROptions = {
    parse_url: false,
    ec_level: "M",
    size: 5,
    margin: 4,
    transparent: false, // default is false for bitmap to keep default behaviour
  };
  
  const VECTOR_OPTIONS: QROptions = {
    parse_url: false,
    ec_level: "M",
    size: 0,
    margin: 1,
    //color: null,
    //background: null,
    transparent: true, // default is true for vector to keep default behaviour
  };


export function get_options(
    options: ECLevel | QROptions,
    force_type?: string,
  ): QROptions {

    var opts: QROptions = {};
  
    if (typeof options === "string") {
      opts.ec_level = options;
      opts.type = force_type || DEFAULT_TYPE;
      
      if (opts.type === 'png'){

        opts = {
            ...BITMAP_OPTIONS,
            ...opts,
          };
      } else{
          opts = {
              ...VECTOR_OPTIONS,
              ...opts,
            };
      }

    } else {    // options object passed
      opts.type = force_type || options.type || DEFAULT_TYPE;

      if (opts.type === 'png'){

          opts = {
              ...BITMAP_OPTIONS,
              ...options,
              type: opts.type
            };
        } else{
            opts = {
                ...VECTOR_OPTIONS,
                ...options,
                type: opts.type
              };
        }
    }

    return opts as QROptions;
  }
  