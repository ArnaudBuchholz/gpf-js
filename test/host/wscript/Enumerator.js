"use strict";

class Enumerator {

    constructor (items) {
        this._items = items;
        this._index = 0;
    }

    atEnd () {
        return this._index === this._items.length;
    }

    moveNext () {
        ++this._index;
    }

    item () {
        return this._items[this._index];
    }

}

module.exports = Enumerator;
