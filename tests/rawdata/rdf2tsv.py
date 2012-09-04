import sys, rdflib
from rdflib.graph import Graph
from rdflib.term import URIRef, Literal
from cStringIO import StringIO
from rdflib import plugin
plugin.register(
    'sparql', rdflib.query.Processor,
    'rdfextras.sparql.processor', 'Processor')
plugin.register(
    'sparql', rdflib.query.Result,
    'rdfextras.sparql.query', 'SPARQLQueryResult')

def get_local(uri):
    idx = uri.index(u"#")
    return uri[idx+1:]

if len(sys.argv) != 2:
    print "Usage: "+sys.argv[0]+" [source.rdf]"
    sys.exit()

src = sys.argv[1]

g = Graph()
g.parse(src, format="n3")

query = "SELECT ?s ?p ?o WHERE { ?s ?p ?o }"

predmap = {
    "http://www.w3.org/2003/01/geo/wgs84_pos#lat": "Latitude",
    "http://www.w3.org/2003/01/geo/wgs84_pos#long": "Longitude",
    "http://www.w3.org/2000/01/rdf-schema#label": "Name/Label",
}

data = {}
preds = {}

for bindings in g.query(query):
    (s, p, o) = bindings
    if unicode(p) in predmap:
        pred = predmap[unicode(p)]
    else:
        pred = get_local(unicode(p))

    preds[pred] = True
    subj = unicode(s)
    if subj not in data:
        data[subj] = {}
    if pred not in data[subj]:
        data[subj][pred] = []

    data[subj][pred].append(unicode(o))

header = []
for pred in preds:
    header.append(pred)

print u"\t".join(header)

for subj in data:
    row = u""
    if len(data[subj].keys()) == 1:
        continue # this is just a label, so ignore

    for pred in header:
        if pred in data[subj]:
            vals = data[subj][pred]
            val_str = u", ".join(vals)
            row += val_str
        row += u"\t"

    row = row.replace(u"\u2605", " stars")
    print row.encode("utf-8")

