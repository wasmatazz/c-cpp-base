
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
const globs = args;
const mergedGlob = globs.length === 1 ? globs[0] : '@(' + globs.join('|') + ')';
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
  '-I', path.resolve(__dirname, 'include'),
  '-o', 'module.wasm',
  ...files
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
