"use strict";

a b c

class Test {

	@gpf.attribute()
	get id() {
		return this._id;
	}

	constructor() {
		this._id = "ABC";
	}

}

module.exports = Test;
