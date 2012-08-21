from __future__ import division

import collections
import itertools
import pprint

from api_fields import apis

results = {}

def print_results():
	pprint.pprint(results)

def powerset(iterable):
	"powerset([1,2,3]) --> () (1,) (2,) (3,) (1,2) (1,3) (2,3) (1,2,3)"
	s = list(iterable)
	return itertools.chain.from_iterable(itertools.combinations(s, r) for r in range(len(s)+1))

def flatten(x):
    result = []
    for el in x:
        if hasattr(el, "__iter__") and not isinstance(el, basestring):
            result.extend(flatten(el))
        else:
            result.append(el)
    return result

# Get terminology overlaps
for combo in powerset(apis.keys()):			# For all combinations of apis..
	if len(combo) < 2:
		continue							# ..which include 2 or more apis..

	results['intersection:'+','.join(combo)] = reduce( # ..record the..
		lambda x, y: x & y,					# ..intersection of each element in..
		[set(apis[api]) for api in combo])	# ..every set of api attributes.

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

for api, attributes in apis.iteritems():
	# Get attribute counts
	results['attributes:'+api] = len(attributes)

	flatPathDepths = flatten(uniqPathDepths(attributes))
	results['maxdepth:'+api] = sorted(flatPathDepths)[-1]
	results['avgdepth:'+api] = sum(flatPathDepths) / len(flatPathDepths)

# Print results if not imported (i.e: called from the commandline)
if __name__ == "__main__":
	print_results()
