
// ============ table creation ===================
exports.CREATE = {
  OBJ_TABLE : "create table if not exists nodebox_objs( " +
   "writeid serial primary key, " + 
   "uri varchar(2048) NOT NULL, " +
   "type varchar(2048), " +
   "graph varchar(2048) DEFAULT '', " +
   "version integer DEFAULT 0," +
   "deleted boolean DEFAULT false" +
  "); ",
  PROPS_TABLE : "create table if not exists nodebox_props ( " +
    "properties_of integer REFERENCES nodebox_objs (writeid) NOT NULL, " +
    "property varchar(2048) NOT NULL, " + 
    " value_index int DEFAULT 0, " + 
    " literal_value text, " + 
    " literal_type varchar(255) DEFAULT '', " + 
    " object_ref varchar(2048), " + 
    " object_ref_version integer DEFAULT 0," + 
    " PRIMARY KEY (properties_of, property, value_index) " + 
  " ); "
};

exports.READ = {
   SELECT_ALL : "select * from nodebox_props, (select nodebox_objs.writeid, nodebox_objs.uri from nodebox_objs, (select uri,max(version) as highest_version from nodebox_objs group by uri) as maxver where nodebox_objs.uri=maxver.uri AND nodebox_objs.version=maxver.highest_version) as latest where nodebox_props.properties_of=latest.writeid;",
  SELECT_URI : "select * from nodebox_props, (select nodebox_objs.writeid, nodebox_objs.uri from nodebox_objs, (select uri,max(writeid) as highest_version from nodebox_objs where uri=$1 and graph=$2 group by uri) as maxver where nodebox_objs.uri=maxver.uri AND nodebox_objs.writeid=maxver.highest_version) as latest where nodebox_props.properties_of=latest.writeid;",
  GET_OBJS_IN_GRAPH : "select writeid,nodebox_objs.uri,deleted from nodebox_objs, (select max(writeid),uri from nodebox_objs where graph=$1 group by uri) as wi where writeid=wi.max;",
  GET_UNDELETED_OBJS_IN_GRAPH : "select writeid,nodebox_objs.uri,deleted from nodebox_objs, (select max(writeid),uri from nodebox_objs where graph=$1 group by uri) as wi where writeid=wi.max and deleted=false;",
  GET_ALL_UNDELETED_OBJS : "select writeid,nodebox_objs.uri,deleted from nodebox_objs, (select max(writeid),uri from nodebox_objs group by uri) as wi where writeid=wi.max and deleted=false;",
  GET_ALL_OBJS : "select writeid,nodebox_objs.uri,deleted from nodebox_objs, (select max(writeid),uri from nodebox_objs group by uri) as wi where writeid=wi.max;",
  GET_GRAPHS : "select distinct graph from nodebox_objs where deleted=false;"	
};

exports.WRITE = {
   OBJECT : "insert into nodebox_objs (uri, graph, version, deleted) values ($1, $2, $3, $4) returning writeid;",
   PROPERTY_OBJECT : "insert into nodebox_props (properties_of, property, value_index, object_ref) values ($1, $2, $3, $4);",
   PROPERTY_LITERAL : "insert into nodebox_props (properties_of, property, value_index, literal_type, literal_value) values ($1, $2, $3, $4, $5);"   
};
