

( function(root, _){
	
  var root = this;
  var modules = {};

  var resolve = function(m){
  	if ( _.isString(m) ){
  		if ( modules[m] ) {
  			return modules[m];
  		}
  		throw 'Cannot resolve name ' + m;
  	}
  	if ( _.isObject(m) ){
  		if ( m.name ){
  			return resolve( m.name );
  		}
  		throw 'Object has no property "name".';
  	}
  	if ( _.isFunction(m) ){
  		return m;
  	}
  };

  var build = function( inst, context ){
  	var built = {};
    _.each( _.keys(inst.handlers), function(method){
      built[ method ] = function(){ return inst.handlers[ method ].apply(built, arguments); };
    });
    _.each( _.keys(  _.omit(inst, ['events', 'handlers']) ), function(method){
      if ( _.isFunction(inst[ method ]) ){
        built[ method ] = function(){ return inst[ method ].apply(built, arguments); };
      } else {
        built[ method ] = inst[ method ];
      }
      
    });
  	built.trigger = function() {
  		var eventName = arguments[0];
  		if ( _.has( inst.events, eventName )){
  			var e = inst.events[ eventName ];
  			if ( _.isFunction(e) ){
  				e.call(undefined, new Event(context, eventName));
  				return;
  			}
  			context.trigger( eventName, _.rest(arguments));
  			return;
  		}
  		throw 'Module ' + inst.name + ' cannot emit event ' + eventName + '.';
  	};

    inst.initialize.call(built);
  	return built;
  };

  var seq = function(left, right){
  	var module = new Module( _.uniqueId('c'), {
  		events: right.events,
  		handlers: left.handlers
  	});
  	module.build = function( context ) {
  		var rBuilt = right.build( context );
  		var lBuilt = left.build( new Context( _.omit(rBuilt, 'trigger') ) );
  		return lBuilt; 
  	};
  	return module;
  };

  var dot = function(left, right){
  	var module = {
  		events:{}, handlers:{}
  	};
  	_.each( ['events', 'handlers'], function(attr){
  		module[ attr ] = _.clone( left[attr] );
  		_.each( _.keys(right[attr]), function(key){
  			if ( module[attr][key] ){
  				module[attr][key] = function(){
  					if (_.isFunction( left[attr][key] ))
  						left[attr][key].apply(undefined, arguments);
  					if (_.isFunction( right[attr][key] ))
  						right[attr][key].apply(undefined, arguments);
  				};
  			} else {
  				module[attr][key] = right[attr][key];
  			}
  		});
  	});
  	return new Module( _.uniqueId('c'), module );
  };

  var trace = function(left, events){
  	var module = new Module( _.uniqueId('c'), {
  		events: left.events,
  		handlers: _.omit(left.handlers, events )
  	});
  	module.build = function( context ) {
      var clonedCtx = _.clone( context ),
      lBuilt = left.build( clonedCtx );
      clonedCtx.listenTo(_.pick(lBuilt, events) );
      return _.omit(lBuilt, events);
    };
    return module;
  };

  var wrap = function(left, attributes ){
  	var module = {
  		events:{}, handlers:{}
  	};
  	_.each(['events', 'handlers'], function(attr){
  		_.each( _.keys(left[ attr ]), function(key){
  			if ( attributes[attr][key] ){
  				if ( attributes[attr][key].rename ){
  					module[attr][ attributes[attr][key].rename ] = left[attr][key];
  				}
  			} else {
  				module[attr][key] = left[attr][key];
  			}
  		});
  	});
   return new Module( _.uniqueId('c'), module);

 };

 var isEqualSet = function( firstSet, secondSet ){
   return _.difference( firstSet, secondSet ).length == 0 &&
   _.difference( secondSet, firstSet ).length == 0 
 };

 var Cat = root.Cat = {
   VERSION: '0.1.0',

   define: function( name, parents, attributes ){
    var module = {
     events:{}, handlers:{}
   };
   if ( ! modules[name] ){
     _.each( parents, function(name){
      var parent = resolve(name);
      _.each(['events', 'handlers'], function(attr){
       _.extend( module[ attr ], parent[ attr ] );
     });
     _.extend( module, _.omit(parent, ['events', 'handlers', 'name']))
    });
     _.each(['events', 'handlers'], function(attr){
      _.extend( module[ attr ], attributes[ attr ] );
    });
     _.extend( module, _.omit(attributes, ['events', 'handlers']))
     modules[ name ] = new Module(name, module);
     return modules[name];
   } 
   throw 'Module name ' + name + ' already used.';
 },
 inst: function( name, options ){
  var inst = modules[ name ];
  inst.options = options;
  return inst;
},
seq: function(){
  var left = resolve( arguments[0] );
  _.each( _.rest(arguments), function(m){
   var right = resolve(m);
   if ( isEqualSet( _.keys(left.events), _.keys(right.handlers) ) ){
    left = seq(left, right);
  } else {
    throw 'Incompatible module types.';
  }

});
  return left;
},
dot: function(){
  var left = resolve( arguments[0] );
  _.each( _.rest(arguments), function(m){
   var right = resolve(m);
   left = dot(left, right);
 });
  return left;		
},
trace: function( m, events ){
  var left = resolve(m);
  if ( _.difference( events, _.keys(left.events) ).length !== 0 )
   throw "Cannot trace events not emitted by this module.";
 if ( _.difference( events, _.keys(left.handlers) ).length !== 0 )
   throw "Cannot feedback some events: no handler.";
 return trace( left, events );
},
wrap: function( m, attributes ){
  var left = resolve(m);
  return wrap(left, attributes);
}
};

var Module = Cat.Module = function(name, attributes) {

 var self = this;
 this.name = name;
 this.events = attributes.events || {};
 this.handlers = attributes.handlers || {};
 _.extend( this, _.omit(attributes, ['events', 'handlers']));

 this.build = function(context){
   return build( self, context );
 };
};



_.extend(Module.prototype, {


initialize: function(){

},

start: function(){
  return this.build( new Context );
},

trace: function( events ){
 return Cat.trace(this, events);
},

dot: function( module ){
 return Cat.dot(this, module);
},

seq: function( module ){
 return Cat.seq(this, module);
},

wrap: function( options ){
  return Cat.wrap(this, options);
}

});

var Context = function( eventMap ){
  this.eventMap = eventMap || {};
};

_.extend(Context.prototype, {
 trigger: function(event){
  var params = _.rest(arguments);
  if ( _.has( this.eventMap, event ) ){
   this.eventMap[ event ].apply(null, params);
 }
},
listenTo: function(eventMap){
  _.extend( this.eventMap, eventMap );
}
});

var Event = Cat.Event = function( context, name ){
	
	this.propagate = function(){
		context.trigger(name);
	};
	this.stop = function(){
		// do nothing
	};
};


})(this, _);