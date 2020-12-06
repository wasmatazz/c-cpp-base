
#ifndef WASMATAZZ_DOT_H
#define WASMATAZZ_DOT_H

#define wasm_export __attribute__((visibility("default")))
#define wasm_export_as(name) __attribute((export_name(name)))
#define wasm_import __attribute__((import_module("env")))
#define wasm_import_from(namespace) __attribute__((import_module(namespace)))
#define wasm_import_as(namespace, name) __attribute__((import_module(namespace))) __attribute__((import_name(name)))

#endif // WASMATAZZ_DOT_H
