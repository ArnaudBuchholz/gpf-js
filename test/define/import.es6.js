"use strict";

class MyAbstractClass {
    get $attributes () { return [] }
    get $abstract () { return true }

    get "[name]" () { return [] }

}

class MyClass extends MyAbstractClass {

    constructor () {

    }

}

console.log(MyAbstractClass.name)
console.log(Object.getOwnPropertyNames(MyAbstractClass.prototype))
console.log(MyAbstractClass.prototype.$abstract)
delete MyAbstractClass.prototype.$abstract
console.log(Object.getOwnPropertyNames(MyAbstractClass.prototype))
