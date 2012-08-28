import re

def parse_menu(data):

    groups = re.findall(r'<tr><td.*?>(.*?)</td><td .*?>.*?</td><td.*?>(.*?)</td></tr>', data, flags=re.DOTALL)
    items = []
    for group in groups:
        if len(group) != 2:
            continue

        item_raw = group[0]
        price_raw = group[1]

        item_group = re.findall(r'<big>(.*?)</big></a>&nbsp;(.*?)<br>', item_raw)
        if len(item_group) != 1 or len(item_group[0]) != 2:
            continue

        item = item_group[0][0]
        item_detail = item_group[0][1]

        price_group = re.findall(r'<.*?>[^\d]*([\d\.]+)<.*?>', price_raw)
        if len(price_group) != 1:
            continue

        price = price_group[0]
            
        item = {"label": item, "price": price}
        if item_detail != "":
            item['detail'] = item_detail

        items.append(item)

    return items

sources = [
    {   "file": "coriander.html",
        "label": "Coriander Lounge",
        "uri": ":menu1",
    },
    {   "file": "zen.html",
        "label": "Zen Southampton",
        "uri": ":menu2",
    },
    {   "file": "oldtown.html",
        "label": "Old Town Kitchen",
        "uri": ":menu3",
    },
]

print """@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix : <http://webbox.ecs.soton.ac.uk/ontology/chi2012-data#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .

:MenuItem rdfs:label "Menu Item" .
:Menu rdfs:label "Restaurant Menu" .

"""

for src in sources:
    f = open(src['file'])
    data = ""
    for line in f.readlines():
        line = line.decode("latin1")
        line = line.encode("utf8")
        data += line

    f.close()

    print src['uri']

    menu = parse_menu(data)
    for item in menu:
        detail = ""
        if "detail" in item:
            detail = " ; :item_detail \"\"\""+item['detail']+"\"\"\""
        print "    :menu_item [ rdf:type :MenuItem ; rdfs:label \"\"\"%s\"\"\" ; :item_price \"\"\"%s\"\"\" %s ] ;" % (item['label'], item['price'], detail)

    print "    rdf:type :Menu ;\n"
    print "    rdfs:label \"\"\"" + src['label'] + "\"\"\" .\n"

