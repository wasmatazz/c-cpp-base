# c-cpp-base
Package base for C/C++ based projects.

## Setup
- Download the latest release of [wasi-sdk](https://github.com/WebAssembly/wasi-sdk/releases) for your platform, and install it somewhere.
- Find the absolute path to the wasi-sdk root folder (it should contain `bin/`, `lib/` and `share/` subfolders) and set the npm config item `wasi_sdk_root` to this path, i.e.:

        npm config set wasi_sdk_root <path>

## Usage
- Add this package as a dev dependency.
- Create a `prepublishOnly` script `wasmatazz-c path/to/c/*.c` where `path/to/c/*.c` is replaced with one or more paths to C files to compile.
