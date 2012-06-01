var should = require('should');
var _ = require('underscore');
var Reaper = require('../reaper').Reaper;

describe('Reaper', function(){

  describe('#register', function(){
    it ('adds a content type and handler to the registry', function(){
      var m = new Reaper();
      m.register('application/json',
                 function(){return "IN";},
                 function(){return "OUT"})
      _.keys(m._handlers)[0].should.equal('application/json');
      m._handlers['application/json']._inF().should.equal("IN");
      m._handlers['application/json']._outF().should.equal("OUT");
    })
  });

  describe('#isRegistered', function(){
    it ("checks for a content type in the registry and returns false if it's not there", function(){
      var m = new Reaper();
      m.isRegistered('application/json').should.equal(false)
    })
    it ("checks for a content type in the registry and returns true if it's there", function(){
      var m = new Reaper();
      m.register('application/json', function(){}, function(){})
      m.isRegistered('application/json').should.equal(true)
    })
  });

  describe('#setDefault', function(){
    it ('sets the default content type to use when none is explicitly specified', function(){
      var m = new Reaper();
      m.register('application/json', function(){}, function(){})
      m.setDefault('application/json');
      m._default.should.equal('application/json');
    })
  });

  describe('#in', function(){
    it ('takes a content type and body and runs them through the in-handler to get a return value', function(){
      var m = new Reaper();
      function jsonIn(str){
        return JSON.parse(str);
      }
      function jsonOut(obj){
        return JSON.stringify(obj);
      }
      m.register('application/json', jsonIn, jsonOut);
      var obj = m.in("application/json", '{"hello" : "world"}');
      obj.hello.should.equal("world");
    });
  });
  describe('#out', function(){
    it ('takes an accept header and data hash and runs them through the out-handler to get a return type and value', function(){
      var m = new Reaper();
      function jsonIn(str){
        return JSON.parse(str);
      }
      function jsonOut(obj){
        return JSON.stringify(obj);
      }
      m.register('application/json', jsonIn, jsonOut);
      var obj = m.out("application/json, text/javascript, */*; q=0.01", {"hello" : "world"});
      obj.type.should.equal("application/json");
      obj.content.should.equal('{"hello":"world"}');
    });
    it ('takes a wild card accept header and matches an otherwise non-match', function(){
      function jsonIn(str){
        return JSON.parse(str);
      }
      function jsonOut(obj){
        return JSON.stringify(obj);
      }
      var m = new Reaper();
      m.register('application/json', jsonIn, jsonOut);
      var nojson = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8";
      var obj = m.out(nojson, {"hello" : "world"});
      obj.type.should.equal("application/json");
      obj.content.should.equal('{"hello":"world"}');
    });
  });



});