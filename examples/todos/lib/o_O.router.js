;(function() {

var namedParam    = /:\w+/g,
    splatParam    = /\*\w+/g,
    escapeRegExp  = /[-[\]{}()+?.,\\^$|#\s]/g,
    routeStripper = /^[#\/]/;

function regexRoute(str) {
  str = str.replace(escapeRegExp, "\\$&")
           .replace(namedParam, "([^\/]+)")
           .replace(splatParam, "(.*?)")
  return new RegExp('^' + str + '$')
}

o_O.router = o_O.model.extend({}, {
  initialize: function() {
    this.routes = []
  },
  add: function(str, handler) {
    if(str === 404) {
      this.routing_404 = {
        handler: handler
      }
    }
    else {
      this.routes.push({
        regex: regexRoute(str),
        handler: handler
      })
    }
    return this
  },
  run_routing: function(hash) {
    var routes = []
    
    for(var i = 0; i < this.routes.length; i++) { 
      var route = this.routes[i];
      if(route.regex.test(hash))
        routes.push(route)
    }
    
    for(var i = 0; i < routes.length; i++) {
      var params = route.regex.exec(hash).slice(1)
      this.run_route(routes[i], params)
    }
    
    if(routes.length == 0 && this.routing_404)
      this.run_route(this.routing_404, [])
  },
  run_route: function(route, params) {
    if(typeof route.handler == 'string') {
      params.unshift(route.handler)
      this.emit.apply(this, params)
    }         
    else
      route.handler.apply(null, params)
  },
  getHash: function() {
    var match = window.location.href.match(/#(.*)$/);
    return match ? match[1] : '';
  },
  go: function() {
    this.location = this.getHash().replace(routeStripper, '');
    this.run_routing(this.location)
  },
  start: function() {
    var self = this; 
    this.go()
    $(window).bind('hashchange', function() {
      self.go() 
    })
  },
  redirect: function(url, change_hash) {
    if(change_hash === false)
      this.run_routing(url)    
    else {
      var hash = "#!" + url
      document.location.hash == hash
        ? this.go()
        : document.location.hash = hash
    }
  }
})

o_O.extend(o_O.router.prototype, o_O.Events)

}).call(this)
