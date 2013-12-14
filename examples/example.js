// AMD notation in order to define a module
// however, no injected dependencies

Cat.define( 'module-name', [parents] /* inheritance */, {

		// events this module can emit
		events:{
			'a': {}, /* just fire an event a */
			'b': function(event){
				/* when this module rise 'b', catch the event and do... */
				/* event.stop(); // do not propagate */
				/* event.propagate(); // do propagate DEFAULT */
			}
		},
		// events handled by this module
		handlers:{
			'action': function(){
				/* 'this' keeps info about the context */ 
				this.trigger('a', params);
			}
		},

		initialize: function(options){
			// called when the module is created
		},

		destroy: function(){

		}

	}); 

Cat.wrap( 'module-name', {
	/* hide these events */
	events: {
		'b': function( event ){
			/* captured the event. DEFAULT: do not propagate */	
		},
		'a': {
			rename:'new-event-name'
		}		
	},	
	/* hide these handlers */
	handlers:{
		set: {} /* hide, the method does not have a name, hence it is not callable */
		method: {
			rename:'new-method-name' /* rename */
		}
	}

});


// How to reference an existing module
// string: module name
// object { name:'modulename', options}, options are initialize params
// module instance

// Building apps

Cat.inst('modulename');
Cat.seq( m, n, ... );
Cat.dot( m, n, ...);
Cat.trace(m, events);


// methods for module 

inst.start(); // -> inst, create a working instance
inst.stop();

inst.seq( m );
inst.seq( m );
inst.trace( events );
inst.wrap({

});

// example: leaflet plugin

Cat.define('leaflet.plugin', {
	events:{
	},
	handlers:{
		'hide': function(){
			
		},
		'show': function(){
			
		},
		'destroy': function(){
			
		},
		'ready': function(map){
			this.map = map; /* attach a value to this module */
		}
	}
});

Cat.define('leaflet.notes', [ 'leaflet.plugin' ], {
	handlers:{
		'show': function(){
			/* override */
		},
	}
});

///

Cat.define( 'module-three', [ 'module-one', 'module-two' ], {
				events:{
					a:{},
					d:{}
				},
				handlers:{
					foo: function(){ /* overridden */
						console.log('module.three.foo');
					},
					foe: function(){
						console.log('module.three.foe');
					}					
				}
			});

