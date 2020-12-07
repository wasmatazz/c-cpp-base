#!/usr/bin/env node

const path = require('path');
const os = require('os');
const child_process = require('child_process');
const glob = require('glob');

const wasi_sdk_root = process.env.npm_config_wasi_sdk_root;

if (!wasi_sdk_root) {
  console.error('npm config wasi_sdk_root not found');
  process.exit(1);
}

const compiler_path = path.resolve(
  wasi_sdk_root,
  'bin',
  os.platform() === 'win32' ? 'clang.exe' : 'clang',
);

const sysroot_path = path.resolve(
  wasi_sdk_root,
  'share',
  'wasi-sysroot',
);

const args = process.argv.slice(2);
const globs = [];
const includes = [path.resolve(__dirname, 'include')];
const defines = [];
let output = 'output.wasm';
let exportsList = undefined;
for (let arg_i = 2; arg_i < process.argv.length; arg_i++) {
  const arg = process.argv[arg_i];
  if (arg[0] === '-') {
    switch (arg[1]) {
      case 'D': {
        if (arg.length === 2) {
          defines.push(process.argv[++arg_i]);
        }
        else {
          defines.push(arg.slice(2));
        }
        break;
      }
      case 'I': {
        if (arg.length === 2) {
          includes.push(path.resolve(process.cwd(), process.argv[++arg_i]));
        }
        else {
          includes.push(path.resolve(process.cwd(), arg.slice(2)));
        }
        break;
      }
      case 'o': {
        if (arg.length === 2) {
          output = path.resolve(process.cwd(), process.argv[++arg_i]);
        }
        else {
          output = path.resolve(process.cwd(), arg.slice(2));
        }
        break;
      }
      case 'e': {
        if (arg.length === 2) {
          exportsList = path.resolve(process.cwd(), process.argv[++arg_i]);
        }
        else {
          exportsList = path.resolve(process.cwd(), arg.slice(2));
        }
        break;
      }
      default: {
        console.error('unknown switch: ' + arg);
        process.exit(2);
        break;
      }
    }
  }
  else {
    globs.push(arg);
  }
}
const mergedGlob = globs.length === 1 ? globs[0] : '{' + globs.join(',') + '}';
const files = glob.sync(mergedGlob, {absolute:true});

const compile_args = [
  '--target=wasm32-wasi',
  '-nostartfiles',
  '--sysroot', sysroot_path,
  '-Wl,-import-memory',
  '-Wl,-import-table',
  '-Wl,-export-dynamic',
  '-Wl,-allow-undefined',
  '-Wl,-no-entry',
  '-o', output,
  ...defines.map(v => '-D'+v),
  ...includes.map(v => '-I'+v),
  ...files,
  ...exportsList ? ['-exported-symbols-list', path.resolve(process.cwd(), exportsList)] : [],
];

const compile_proc = child_process.spawn(
  compiler_path,
  compile_args,
  {
    stdio: 'inherit'
  },
)

compile_proc.on('exit', code => {
  if (code !== 0) {
    process.exit(code);
  }
});
