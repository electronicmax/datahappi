""" File for easier generation of fake RDF/XML data specific to the back example.
	Requires rdflib. """

import rdflib, random, math, time

namespace = rdflib.Namespace("http://volant.ecs.soton.ac.uk")

transactionPred = rdflib.URIRef(namespace + "/predicates/transaction")
costPred = rdflib.URIRef(namespace + "/predicates/cost")
namePred = rdflib.URIRef(namespace + "/predicates/item")

account = rdflib.URIRef(namespace + "/accounts/1234567890")
transactions = rdflib.URIRef(account + "/transactions")

def getrdf() :
	getrdf.rdfGraph = rdflib.Graph()

	getrdf.transCount = 0
	getrdf.lastTransactionID = 876538
	def newTransaction(item, cost):
		getrdf.transCount += 1
		getrdf.lastTransactionID += 1 + int(random.random() * 1000)

		s_t = account
		p_t = transactionPred
		o_t = rdflib.URIRef(transactions + "#" + str(getrdf.lastTransactionID))
		transactionTriple = (s_t, p_t, o_t)

		s_c = o_t
		p_c = costPred
		o_c = rdflib.Literal(cost)
		costTriple = (s_c, p_c, o_c)

		s_i = o_t
		p_i = namePred
		o_i = rdflib.Literal(item)
		itemTriple = (s_i, p_i, o_i)

		when = time.time() - ((356 * 24 * 60 * 60) * 1.2**-getrdf.transCount)
		s_w = o_t
		p_w = namePred
		o_w = rdflib.util.date_time(when)
		whenTriple = (s_w, p_w, o_w)

		getrdf.rdfGraph.add(transactionTriple)
		getrdf.rdfGraph.add(costTriple)
		getrdf.rdfGraph.add(itemTriple)
		getrdf.rdfGraph.add(whenTriple)

	newTransaction("Direct Debit: Rent", 130)
	newTransaction("Cash machine withdrawal", 20)
	newTransaction("Restaurant meal", 25)
	newTransaction("Laptop", 450)
	newTransaction("Laptop battery", 50)
	newTransaction("Laptop battery refund", -50)
	newTransaction("New car", 1500)
	newTransaction("Insurance", 300)
	newTransaction("Payday", -500)
	newTransaction("Cash machine withdrawal", 20)

	return getrdf.rdfGraph.serialize()

def writerdf():
	FILE = open("banks.rdf", 'w')
	FILE.write(getrdf())
	FILE.close()

writerdf();
