#!/bin/bash
while true; do
	for i in *.less ; do 
		[[ -f "$i" ]] || continue
		echo "compilin' " "${i%.less}.css"
		lessc "$i" > "${i%.less}.css"
	done
	sleep 1
done
