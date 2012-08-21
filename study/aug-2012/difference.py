from __future__ import division
import itertools

from api_fields import *

results = {}

results['shared:fb,plus'] = set(facebook.keys()) & set(plus.keys())
results['shared:plus,twitter'] = set(plus.keys()) & set(twitter.keys())
results['shared:twitter,fb'] = set(twitter.keys()) & set(facebook.keys())
results['shared:all'] = set(facebook.keys()) & set(plus.keys()) & set(twitter.keys())

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
