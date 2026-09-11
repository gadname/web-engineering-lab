#!/usr/bin/env bash
# tsc は .ts しか dist に出さないため、Prisma の生成物のうち実行時に要る非 TS ファイル
# （クエリエンジンのバイナリ *.node と schema.prisma）を dist の対応する場所へコピーする。
set -euo pipefail

SRC="src/infrastructures/shared/clients/databaseClient/prisma"
DST="dist/infrastructures/shared/clients/databaseClient/prisma"

mkdir -p "$DST"
find "$SRC" -maxdepth 1 -type f \( -name '*.node' -o -name 'schema.prisma' -o -name '*.wasm' \) -exec cp {} "$DST"/ \;
echo "copied prisma runtime files to $DST"
