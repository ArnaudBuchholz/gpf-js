const attribute = gpf.attributes.decorator;

class Attribute extends gpf.attributes.Attribute {
    get value () {
        return 1;
    }
}

class Test {

    // @attribute(new Attribute())
    get id () {
        return this._id;
    }

    constructor () {
        this._id = "ABC";
    }

}

// Until decorators are implemented, simulate manually
attribute(new Attribute())(Test, "id");

module.exports = {Attribute, Test};
