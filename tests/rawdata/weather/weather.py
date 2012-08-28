import re

print """@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix : <http://webbox.ecs.soton.ac.uk/ontology/chi2012-data-weather#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .

:WeatherReading rdfs:label \"Weather Reading\" .

"""

# read in data
f = open("sotonweather.tsv", "r")
header = None
data = []
for line in f.readlines():
    line = line.rstrip() # chomp
    row = {}
    if header is None:
        header = line.split("\t")
    else:
        values = line.split("\t")
        for i in range(0, len(values)):
            value = values[i]
            key = header[i]
            row[key] = value
        data.append(row)

# loop over data, outputting n3 to stdout
cursor = 0
for row in data:
    cursor += 1
    print ":row"+str(cursor)+""

    for key in row:
        value = row[key]
        print "    :"+key+" \"\"\""+value+"\"\"\" ;"

    print "    rdf:type :WeatherReading .\n"


