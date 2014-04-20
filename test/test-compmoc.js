'use strict';

var compmoc = require('../lib/compmoc.js');
var util = require('util');
var should = require('should');

describe('Creating a stub object', function() {

    var bob = compmoc.stub(['greet']);

    assertions(bob);
});


describe('Wrapping existing object with expectations', function() {

    var Person = function(name) {
        return Object.freeze({
            greet: function(otherPersonName) {
                return util.format('%s says hello to %s', name, otherPersonName);
            }
        });
    };

    assertions(new Person('non'));
});

function assertions(bob) {
    it('enables counting the number of invocations of a method', function(done) {
        bob = compmoc.wrap(bob);
        bob.greet('alice');
        bob.expect.greet.called.times(1);
        done();
    });

    it('enables the determination that a method has NEVER been called', function(done) {
        bob = compmoc.wrap(bob);
        bob.expect.greet.called.never();
        done();
    });

    it('enables the determination of the args used to invoke the method', function(done) {
        bob = compmoc.wrap(bob);
        bob.greet('alice');
        bob.greet('bob');
        bob.expect.greet.called.withArgs('bob');
        done();
    });

    it('enables overriding a methods body', function(done) {
        bob = compmoc.wrap(bob);
        bob.expect.greet.toDoThis(function(otherPersonName) {
            return util.format('yo %s', otherPersonName);
        });
        var result = bob.greet('alice');
        result.should.eql('yo alice');
        done();
    });

    it('enables setting the return value of a function', function(done) {
        bob = compmoc.wrap(bob);
        bob.expect.greet.toReturn('foobar');
        var result = bob.greet('alice');
        result.should.eql('foobar');
        done();
    });

    it('enables throwing an exception for a method invocation', function(done) {
        bob = compmoc.wrap(bob);
        bob.expect.greet.toThrow('BANG');
        should(function() {
            bob.greet('alice');
        }).
        throw (/BANG/);
        done();
    });

    it('enables setting the return value of a function when specific arguments are provided', function(done) {
        bob = compmoc.wrap(bob);
        bob.expect.greet.when('alice').toReturn('foobar');
        bob.expect.greet.toReturn('barfoo');
        var result1 = bob.greet('alice');
        var result2 = bob.greet('bob');
        result1.should.eql('foobar');
        result2.should.eql('barfoo');
        done();
    });
}
