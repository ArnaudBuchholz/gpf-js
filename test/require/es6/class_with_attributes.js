"use strict";

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
