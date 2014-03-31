var test = require("tape")

var vdomThunk = require("../index")

test("vdomThunk is a function", function (assert) {
    assert.equal(typeof vdomThunk, "function")
    assert.end()
})
