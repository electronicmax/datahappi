from __future__ import division
import itertools

from api_fields import apis

results = {}

def powerset(iterable):
	"powerset([1,2,3]) --> () (1,) (2,) (3,) (1,2) (1,3) (2,3) (1,2,3)"
	s = list(iterable)
	return itertools.chain.from_iterable(itertools.combinations(s, r) for r in range(len(s)+1))


""" Get terminology overlaps """
for combo in powerset(apis.keys()):			# For all combinations of apis..
	if len(combo) < 2:
		continue							# ..which include 2 or more apis..

	results['intersection:'+','.join(combo)] = reduce(
		lambda x, y: x & y,					#..intersect all of the..
		[set(apis[api]) for api in combo])	#..sets of api attributes.
"""

results['attributes:fb'] = len(facebook)
results['attributes:plus'] = len(plus)
results['attributes:twitter'] = len(twitter)

def uniqPathDepths(schema):
	def uniqPathDepthsRecurse(schema, currentDepth):
		try:
			if not isinstance(schema, dict):
				schema = schema[0]
		except IndexError:
			return currentDepth
		except TypeError:
			return currentDepth

		try:
			return map(
				lambda val: uniqPathDepthsRecurse(val, currentDepth+1),
				schema.values())
		except AttributeError:
			return currentDepth

	return uniqPathDepthsRecurse(schema, 0)

def flatten(x):
	try:
		it = iter(x)
	except TypeError:
		yield x
	else:
		for i in it:
			for j in flatten(i):
				yield j

def maximumDepth(schema):
	flatPathDepths = flatten(uniqPathDepths(schema))
	return sorted(flatPathDepths)[-1]

results['maxdepth:fb'] = maximumDepth(facebook)
results['maxdepth:plus'] = maximumDepth(plus)
results['maxdepth:twitter'] = maximumDepth(twitter)

def avgDepth(schema):
	flatPathDepths = list(flatten(uniqPathDepths(schema)))
	return sum(flatPathDepths) / len(flatPathDepths)

results['avgdepth:fb'] = avgDepth(facebook)
results['avgdepth:plus'] = avgDepth(plus)
results['avgdepth:twitter'] = avgDepth(twitter)
"""
