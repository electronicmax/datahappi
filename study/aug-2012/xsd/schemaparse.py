import xml.etree.ElementTree as ET

import pdb
import itertools

xml = ET.parse('shopping.xsd').getroot()

prefix = "{http://www.w3.org/2001/XMLSchema}"

ignore_tags = set([
	prefix+"annotation",
	prefix+"documentation",
	prefix+"complexType",
	prefix+"simpleType"
])

def dictify(xml, root_element_name):
	root_element = filter(
		lambda el: el.get("name") == root_element_name,
		xml.findall(prefix+"element"))[0]

	tag_functions = {
		prefix+"restriction":(lambda el:
			el.get("base")),
		prefix+"union":(lambda el:
			None)}

	def parse_complex_type(complex_type):
		return None

	def parse_simple_type(simple_type):
		return dictify_recurse(simple_type)

	def get_new_types(xml):
		pdb.set_trace()
		newTypes = {}
		# Add simpleTypes
		newTypes.update({simpleType.get("name"):parse_simple_type(simpleType)
			for simpleType in set(xml.findall(prefix+"simpleType")) -
				ignore_tags})
		# Add complexTypes
		newTypes.update({complexType.get("name"):parse_complex_type(complexType)
			for complexType in set(xml.findall(prefix+"complexType")) -
				ignore_tags})
		return newTypes

	def dictify_recurse(xml, types={}):
		# Update list of types
		types.update(get_new_types(xml))

		# Remove all ignored related tags from current level.
		for child in xml:
			if child.tag in ignore_tags:
				xml.remove(child)

		pdb.set_trace()

		if xml.tag == prefix+"element":
			el_type = xml.get("type")
			if el_type in types:
				return types[el_type]
			else:
				return el_type
		elif xml.tag == prefix+"restriction":
			return set([enum.get("value")
				for enum in xml.findall(prefix+"enumeration")])
		elif xml.tag == prefix+"union":
			return (
				set([parse_simple_type(el) 
					for el in xml.findall(prefix+"simpleType")]) |
				set([parse_complex_type(el) 
					for el in xml.findall(prefix+"complexType")]) )

	return dictify_recurse(root_element, get_new_types(xml))

xml_dict = dictify(xml, "GeneralSearchResponse")
