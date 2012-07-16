#!/bin/bash

while true; do
	echo "compilin'"
	lessc box.less > box.css
	lessc ../examples/css/box-example.less > ../examples/css/box-example.css
	sleep 1
done
