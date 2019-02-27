const attribute = gpf.attributes.decorator;

// @attribute(new gpf.attributes.MemberAttribute())
class Attribute extends gpf.attributes.Attribute {

    get value () {
        return this._value;
    }

    constructor (value) {
        super();
        this._value = value;
    }
}

class Test {

    // @attribute(new Attribute(1))
    get id () {
        return this._id;
    }

    // @attribute(new Attribute(2))
    reset () {
        this._id = "";
    }

    constructor () {
        this._id = "ABC";
    }

}

class SubclassOfTest extends Test {

    // @attribute(new Attribute(3))
    reset () {
        super.reset();
    }

}

module.exports = {Attribute, Test, SubclassOfTest};

// Until decorators are implemented, simulate manually
attribute(new gpf.attributes.MemberAttribute())(Attribute);
attribute(new Attribute(1))(Test, "id");
attribute(new Attribute(2))(Test, "reset");
attribute(new Attribute(3))(SubclassOfTest, "reset");
