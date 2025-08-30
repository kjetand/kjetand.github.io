#!/usr/bin/env bash

if [ -z "$1" ]; then
    echo "Usage: $0 <directory>"
    exit 1
fi

SRC_DIR="$1"
DEST_DIR="$SRC_DIR/optimized"

mkdir -p "$DEST_DIR"

counter=1
for f in "$SRC_DIR"/*.JPEG; do
    [ -e "$f" ] || continue
    filename=$(basename "$f" .JPEG)
    convert "$f" -resize 720x -quality 90 "$DEST_DIR/${counter}.jpg"
    ((counter++))
done

rm $SRC_DIR/*.JPEG
mv $DEST_DIR/* $SRC_DIR/.
rm -r $DEST_DIR
