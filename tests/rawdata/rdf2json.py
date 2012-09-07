import sys, rdflib, json
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

data_out = {}

for subj in data:
    row = u""
    if len(data[subj].keys()) == 1:
        continue # this is just a label, so ignore
    data_out[subj] = data[subj]

print u"window.friends = "+json.dumps(data_out).encode("utf-8")+u";"
