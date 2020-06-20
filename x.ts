import {image} from './mod.ts';

const outType = 'svg';

var s = await image("Уникод!", {type: outType})

if (s instanceof Uint8Array)
    await Deno.writeFile( 'out.'+outType, s );
else
    await Deno.writeTextFile( 'out.'+outType , s );
