#!/bin/bash

find . -type f -name "*-orig.mp3" -exec ./convert.sh {} \;
