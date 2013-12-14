Cat({
	debug:true,
	typing:'strict'
}); /* init */


Cat.define('module-name', ['a', 'b'], function(context){

	return {
		
		'c': function(p1){
			
		},
		'd': function(p1, p2){
			
		},
		'e': function(){
			
		}
		
	};
	
});


// rendere i moduli reattivi...?


Cat.define('leaflet.plugin', [], function(context){

	return {
		'hide': function(){
			
		},
		'show': function(){
			
		},
		'destroy': function(){
			
		},
		'ready': function(map){
			// in questo modo può essere chiamato anche dalle estension
			this.map = map;
		}
	}
});

A parte define, gli altri metodi usano dei moduli già definiti che possono essere richiamati con

nome del modulo
{ name:'nome del modulo', options}
instanza di un modulo

Cat.define('name', {
	events:{
		'a': {}, /* just fire */
		'b': function( event ){ /* event.propagate(), event.stop() */
			/* when this module rise 'b', catch the event and do... default: passa*/
		 }
	},
	handlers: {
		'a': function(){
			/* this tiene info sul contesto */
			this.trigger('event', params);
		}
	}
});


var LeafletModule = Cat.Module.extend({
	events:{ },
	'hide': function(){
	},
	'show': function(){
	},
	'destroy': function(){
	},
	'ready': function( map ){
		this.map = map;
	}		
});

Cat.dot(...)
Cat.seq(...)
Cat.trace(...)

module.trace([a, b]);
Cat.trace( module, [a,b]);

/* multiple inheritance: https://gist.github.com/alassek/1227770 */
var NotesLeafletPlugin = LeafletModule.extend( Notes, {
	events:{
		'nuovo evento':{}
		'vecchio evento':{} /* ripetitivo */
		'vecchio evento 2': function(event){
			/* uguale a sopra, default passa */
		}
	},	
	'hide': function(){
		/* override */
	},
	'show': function(){
		/* override */
	},
	'destroy': function(){
		/* override */
	},
	'new-handler': function(){
		this.trigger('nuovo evento');
  	}
	/* definisci metodo che usa metodi di una delle classi */
	'select': function( featureId ){
		/* elemento invoca un metodo del modulo notes che non è visibile da fuori */
		this.set( featureId );
	}
}).wrap({ 
	/* nascondi questi eventi */
	events: {
		'map': function( event ){
			/* cattura evento map lanciato da notes altrimenti ignora, default non passa */	
		},
		'a': {
			rename:'new-event-name'
		}		
	},	
	/* nascondi questi handler */
	set: {} /* nascondi, il metodo non ha più nome */
	method: {
		rename:'new-method-name' /* rinomina */
	}

});

wrap non nasconde solo, ma modifica la interfaccia eseguendo dei rename.
se voglio wrappare un metodo devo fare extend+wrap
ad esempio

nel extend
nuovo-metodo: function(){
	this.vecchio_metodo();
}

nel wrap

vecchio_metodo:{}

questo significa che è presente, ma è invisibile! quindi non devo cancellarlo!
non è eredità prototipale, perché non deve essere proprio trovato!

in generale potrebbe non avere senso usare prototype però potrei usarlo per
distinguere eventi da handler

new NotesLeafletPlugin({
  options	
});

// aggiunge funzionalità a un plugin di leaflet
Cat.define('notes.leaflet.plugin') /* definisce solo il nome, nessun metodo o evento */
   .extend('leaflet.plugin', {
		events:{
			'nuovo evento':{}
			'vecchio evento':{} /* ripetitivo */
			'vecchio evento 2': function(event){
				/* uguale a sopra, default passa */
			}
		},
		handlers:{
			'hide': function(){
				/* override */
			},
			'show': function(){
				/* override */
			},
			'destroy': function(){
				/* override */
			},
			'new-handler': function(){
				this.trigger('nuovo evento');
		  	}			
		}
   })
   .wrap('notes', { /* wrap or hide */
		events: {
			'map': function(){
				/* cattura evento map lanciato da notes altrimenti ignora */	
			}			
		},
		handlers: {
			/* definisci metodi, per invocare quelli del child deve essere fatto esplicitamente */
			'select': function( featureId ){
				/* elemento invoca un metodo del modulo notes che non è visibile da fuori */
				this.set( featureId );
			}	
		}
   });

var app = new App( context );

// contesto ascolta eventi del child
/* var ctx = new Context({
	'map': function(  ){
		// non mandare map, ma costruisci plugin
		child.map( _map );
	}
});
var child = Cat.build({name:'notes'}, ctx); */



// mod = { name:'module-name', options }
// oppure un'instanza di un modulo
// cambia un po' la semantica ma è molto simile a prima

Cat.seq( mod1, mod2, ... );

Cat.dot( mod1, mod2, ... );

Cat.trace( mod, ['a', 'b']);