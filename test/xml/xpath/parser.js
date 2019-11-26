"use strict";

describe("xml/xpath/parser", function () {

    it("parses '//name'", function () {
        var xpath = gpf.xml.xpath.parse("//name");
        assert(xpath.toString() === "//name");
        assert(xpath instanceof gpf.xml.xpath.Deep);
        assert(xpath.getChildren()[0] instanceof gpf.xml.xpath.NodeMatch);
    });

};
