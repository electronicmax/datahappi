from __future__ import division

import collections
import itertools
import pprint

import pdb

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

for group_name, group_apis in apis.iteritems():
	results[group_name] = {}
	# Get terminology overlaps
	for combo in powerset(group_apis.keys()):	# For all combinations of apis..
		if len(combo) < 2:
			continue							# ..of  2 or more apis..

 		# ..record the..
		results[group_name]['shared_terminology:'+','.join(combo)] = reduce(
			lambda x, y: x & y,			# ..intersection of each element in..
			[set(group_apis[api]) for api in combo])	# ..every set of api attributes.

		#results[group_name]['equivalent_fields:'+','.join(combo)] =
			# The number of equivalent fields shared between each api in ombo.

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

	for api, attributes in group_apis.iteritems():
		# Get attribute counts
		results[group_name]['attributes:'+api] = len(attributes)

		flatPathDepths = flatten(uniqPathDepths(attributes))
		results[group_name]['maxdepth:'+api] = sorted(flatPathDepths)[-1]
		results[group_name]['avgdepth:'+api] = sum(flatPathDepths) / len(flatPathDepths)

# Print results if not imported (i.e: called from the commandline)
if __name__ == "__main__":
	print_results()
