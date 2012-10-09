
Nodebox Data store specification
=================================

Nodebox is a lightweight personal data store in NodeJS. The objective
is to make a small, light, efficient and secure semi-structured data
store/web server for keeping precious things like web bookmarks,
tweets, facebook posts, love letters, hate letters, letters from your
boss, to-do items and so on.  

Nodebox // Dependencies 
------------

Two core dependencies: NodeJS and Postgres (9.1 or above).  The rest
are NodeJS dependencies that can be satisfied by npm. See the included
package.json file.

Data Model // Internals
----------

The Data Model is unique (_gasp_).  We took the best parts (we think)
of JSON-LD, RDF, and plain old JSON.  

The data model is based on JSON... an object-model where each object
can have any number of unique (string) keys each with values.

Here is where it diverges. Each object is required to have:

1. an *id* that uniquely identifies the thing the data represents. In RDF, this would correspond to a URI, in CouchDB its _id, etc
2. a *version number* -  all objects are FULLY versioned per graph; that is, every edit to an entity <uri,graph> pair walks up its own unique version sequence, starting at version 0, 
3. a *graph name* -  The graph parameter allows partitioning of facts about a particular
entity across worlds

The graph name may seem peculiar, but this allows multiple data sources to reflect complementary information about the same logical thing. 

The value of each key *must* be be an array of *zero* or more items.  Thus, all
values are automatically *Seqs* (in RDF). Each element of this array can be one of
two things:

1. A literal
2. A reference to another object

Literals are represented as json objects
<pre>
   { value: <some json value>, type*:xsdtype, lang*: <language>, other metadata...  }
</pre>

A refernce to another object is an interesting creature.  We store not only the object id
but its graph and the version of the object at the time the (source) object was serialised, 
so that it can be determined what was known about the target object at any later point.

<pre>
   { id: id_of_object, graph:graph_of_object, version: version  }
</pre>

Database // Table structure
---------------

A challenge of using a relational database for semi-structured data is
fitting the data into tables in a sensible way.  There were two
alternatives we considered: an SPO row-store and... something
trickier.  We opeted for something trickier, because SPO stores of any
reasonable size just end up taking over the world - that is, they get
huge and unwieldy.  Moreover, since we wanted to support full
versioning, we thought SPO would be unmanageable. 

So, instead, our store is an append-only store where each row
corresponds to new specification of a new or existing object. An object specification looks like this:

<pre>
_dbid serial, id text, graph text, version integer default 0, labels text[], properties text[][]
</pre>

with the following definitions :

Object table :

0. *writeid* - internal row identifier                                                                                 
1. *uri* - object id (URI)
2. *graph* - graph name, default '/'
3. *version* - version number
4. *labels* - text array of labels
5. *properties* - foreign key relation to properties table

<pre>
create table nodebox_objs(
      writeid integer primary key,
      uri varchar(2048) NOT NULL,
      type varchar(255),
      graph varchar(2048) DEFAULT '/',
      version integer DEFAULT 0
);
</pre>

And values are stored in the propeties table

Properties table:

1. *id* - identifier
2. *object-table-row* - foreign key relation to associated object table row
2. *property* - property name
3. *value_index* - property sequence number (for array-values)
4. *value_type* - one of prespecified literal types or 'resource'
5. *literal_value* -
6. *literal_type* - 
7. *resource_value* -

<pre>
create table nodebox_props (
    properties_of integer REFERENCES nodebox_objs (writeid) NOT NULL,
    property varchar(2048) NOT NULL,    
    value_index int DEFAULT 0,
    literal_value text,
    literal_type varchar(255) DEFAULT '',     
    object_ref varchar(2048),
    object_ref_version integer DEFAULT 0,
    PRIMARY KEY (properties_of, property, value_index)
);
</pre>

About // Context
-------

Thi work represents a key distributable of the WebBox Project
(<http://webbox.ecs.soton.ac.uk>) by eMax (<http://hip.cat/emax>). The
project is publically funded by the EPSRC (<http://www.epsrc.ac.uk>)
under the Social Machines Project, and also represents work core to
the UK Government's BIS's midata
(<http://www.bis.gov.uk/news/topstories/2012/Aug/next-steps-making-midata-a-reality>)
programme.

