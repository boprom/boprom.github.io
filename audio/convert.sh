#!/bin/bash

if [ $# -eq 0 ]; then
	echo "Usage: convert.sh \$filename";
	exit
fi

filename=$1

if [ ! -e "$filename" ] ||  [ ! -f "$filename" ]; then
	echo "$filename does not exist."
	exit
fi

echo "Processing $filename"

basename=$(sed  's/\([^-]*\)-[^.]*.*$/\1/gi' <<< $filename)
extensions=(ogg mp3)

for ext in "${extensions[@]}"
do
    echo "Converting to $ext."
    sox -S $filename $basename.$ext
done

echo "Done."
