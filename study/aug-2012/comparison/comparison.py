from __future__ import division

import collections
import itertools
import pprint
import sys

import pdb as pdb

from api_fields import apis, equivalent_fields

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

def get_canonical_fields():
	canon = {api:{} for api in apis['social_networks'].keys()}

	for canonName, fieldsByApi in equivalent_fields['social_networks'].iteritems():
		for api, field in fieldsByApi.iteritems():
			if field is not None:
				canon[api][canonName] = field

				# Test code; remove once api_fields has stopped being modified.
				try:
					apis['social_networks'][api][field]
				except KeyError as e:
					print "api '"+api+"' does not have field '"+field+"'!"

	return canon

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

def structure(root):
	""" returns the structure of a dict based tree as nested empty arrays
	{1:1, 2:{3:3, 4:{}}} --> [[], [[], [[]]]] """
	try:
		return [structure(root[child]) for child in root]
	except TypeError:
		return []

canonical_fields = get_canonical_fields()

for group_name, group_apis in apis.iteritems():
	results[group_name] = {}
	# Get terminology and equivalence overlaps
	for combo in powerset(group_apis.keys()):	# For all combinations of apis..
		if len(combo) >= 2:						# ..of  2 or more apis..
			# ..record the..
			results[group_name]['shared_terminology:'+','.join(combo)] = reduce(
				lambda x, y: x & y,			# ..intersection of each element in..
				[set(group_apis[api]) for api in combo])	# ..every set of api attributes.

			# Get equivalent fields
			results[group_name]['equivalent_fields:'+','.join(combo)] = reduce(
				lambda x, y: x & y,
				[set(canonical_fields[api].keys()) for api in combo])

		if len(combo) == 2:
			non_canon_equivalences = [(canonical_fields[combo[0]][f], canonical_fields[combo[1]][f])
										for f in set(canonical_fields[combo[0]].keys()) & set(canonical_fields[combo[1]].keys())]

			# Get equivalent but terminologically heterogeneous fields
			results[group_name]['terminologically_heterogeneous:'+','.join(combo)] = set(filter(
				lambda fields: fields[0] != fields[1],
				non_canon_equivalences))

			# Get equivalent but structurally heterogeneous fields
			results[group_name]['structurally_heterogeneous:'+','.join(combo)] = set(filter(
				lambda fields: not (
					len(fields[0].split(".")) == len(fields[1].split(".")) and # Fields have the same depth
					(structure(	# Fields have the same structure
						reduce(lambda fields, field: fields[field],
							fields[0].split("."),
							group_apis[combo[0]])) ==
					structure(
						reduce(lambda fields, field: fields[field],
							fields[1].split("."),
							group_apis[combo[1]])))),
				non_canon_equivalences
			))

			# Get equivalent but semantically heterogeneous fields


	for api, attributes in group_apis.iteritems():
		# Get attribute counts
		results[group_name]['attributes:'+api] = len(attributes)

		flatPathDepths = flatten(uniqPathDepths(attributes))
		results[group_name]['maxdepth:'+api] = sorted(flatPathDepths)[-1]
		results[group_name]['avgdepth:'+api] = sum(flatPathDepths) / len(flatPathDepths)

# Print results if not imported (i.e: called from the commandline)
if __name__ == "__main__":
	print_results()
