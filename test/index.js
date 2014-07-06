var test = require('tape');

var partial = require('../index');
var createPartial = require('../partial');
var shallowEq = require('../shallow-eq');

test('vdomThunk is a function', function (assert) {
    assert.equal(typeof partial, 'function');
    assert.end();
});

test('the thunk is initialised using the data that was passed',
    function (assert) {
        var initial = { a: 'test' };
        var thunk = partial(function render(data) {
            assert.equal(data, initial);
            assert.end();
        }, initial);

        thunk.render();
    });

test('the initialised data can be null', function (assert) {
    var initial = null;
    var thunk = partial(function render(data) {
        assert.equal(data, initial);
        assert.end();
    }, initial);

    thunk.render();
});

test('the initialised data can be undefined', function (assert) {
    var initial;
    var thunk = partial(function render(data) {
        assert.equal(data, initial);
        assert.end();
    }, initial);

    thunk.render();
});

test('the initialised data can be a value type number', function (assert) {
    var initial = 0;
    var thunk = partial(function render(data) {
        assert.equal(data, initial);
        assert.end();
    }, initial);

    thunk.render();
    assert.end();
});

test('the initialised data can be a value type string', function (assert) {
    var initial = "";
    var thunk = partial(function render(data) {
        assert.equal(data, initial);
        assert.end();
    }, initial);

    thunk.render();
});


test('the initialised data can be a value type boolean', function (assert) {
    var initial = false;
    var thunk = partial(function render(data) {
        assert.equal(data, initial);
        assert.end();
    }, initial);

    thunk.render();
});


test('the initialised data can be an object', function (assert) {
    var initial = {};
    var thunk = partial(function render(data) {
        assert.equal(data, initial);
        assert.end();
    }, initial);

    thunk.render();
});

test('the initialised data can be an array', function (assert) {
    var initial = [];
    var thunk = partial(function render(data) {
        assert.equal(data, initial);
        assert.end();
    }, initial);

    thunk.render();
});


test('the initialised data can be a function', function (assert) {
    var initial = function () {};
    var thunk = partial(function render(data) {
        assert.equal(data, initial);
        assert.end();
    }, initial);

    thunk.render();
});

test('thunk can be keyed using { key: } in first arg', function (assert) {
    var initial = { key: 'the-key' };
    var thunk = partial(function render(data) {
        assert.equal(data, initial);
    }, initial);

    thunk.render();
    assert.equal(thunk.key, initial.key);
    assert.end();
});

test('thunk can be keyed using { id: } in first arg', function (assert) {
    var initial = { id: 'the-key' };
    var thunk = partial(function render(data) {
        assert.equal(data, initial);
    }, initial);

    thunk.render();
    assert.equal(thunk.key, initial.id);
    assert.end();
});

test('multiple args can be used', function (assert) {
    var initialA = {};
    var initialB = "";
    var initialC = 0;

    var thunk = partial(function render(a, b, c) {
        assert.equal(a, initialA);
        assert.equal(b, initialB);
        assert.equal(c, initialC);
        assert.end();
    }, initialA, initialB, initialC);

    thunk.render();
});

test('cached vnodes can be used', function (assert) {
    var initial = { favorite: 'cats' };
    var rendered = false;
    var vnode = {};

    function render(data) {
        if (!rendered) {
            assert.equal(data, initial);
        } else {
            assert.error('Rendered too many times');
        }

        rendered = true;

        return vnode;
    }

    var previousThunk = partial(render, initial);
    var currentThunk = partial(render, initial);

    var previousRender = previousThunk.render();
    previousThunk.vnode = previousRender;
    assert.ok(rendered);
    assert.equal(previousRender, vnode);

    var result = currentThunk.render(previousThunk);
    assert.equal(result, previousRender);
    assert.end();
});


test('custom eq can be used', function (assert) {
    var initial = { favorite: 'cats' };
    var update = { favorite: 'dogs' };
    var eqCalled = false;

    var eqPartial = createPartial(function eq(currentArgs, previousArgs) {
        assert.strictEqual(currentArgs[0].favorite, update.favorite);
        assert.strictEqual(previousArgs[0].favorite, initial.favorite);
        if (eqCalled) {
            assert.error('Computed eq too many times');
        }
        eqCalled = true;
        return false;
    });

    var rendered = false;

    function render(data) {
        if (!rendered) {
            assert.equal(data, update);
        } else {
            assert.error('Rendered too many times');
        }

        rendered = true;
    }

    var previousThunk = eqPartial(render, initial);
    var currentThunk = eqPartial(render, update);

    currentThunk.render(previousThunk);
    assert.ok(eqCalled);
    assert.ok(rendered);
    assert.end();
});

test('no rerender if there are no args', function (assert) {
    var renderCount = 0;
    var vnode = {};

    function render() {
        renderCount++;
        return vnode;
    }

    var previousThunk = partial(render);
    var previousRender = previousThunk.render();
    previousThunk.vnode = previousRender;
    assert.equal(previousRender, vnode);
    assert.equal(renderCount, 1);

    var currentThunk = partial(render);
    var result = currentThunk.render(previousThunk);
    assert.equal(result, previousRender);
    assert.equal(renderCount, 1);
    assert.end();
});

test('rerender if there are different number of args', function (assert) {
    var renderCount = 0;
    var vnodes = [{}, {}];

    function render() {
        var result = vnodes[renderCount++];
        return result;
    }

    var previousThunk = partial(render, 1, 2, 3);
    var previousRender = previousThunk.render();
    previousThunk.vnode = previousRender;
    assert.equal(previousRender, vnodes[0]);
    assert.equal(renderCount, 1);

    var currentThunk = partial(render, 1, 2, 3, 4);
    var result = currentThunk.render(previousThunk);
    assert.equal(result, vnodes[1]);
    assert.equal(renderCount, 2);
    assert.end();
});

test('rerender if there are mismatched items in args', function (assert) {
    var renderCount = 0;
    var vnodes = [{}, {}];

    function render() {
        var result = vnodes[renderCount++];
        return result;
    }

    var previousThunk = partial(render, 1, 2, 3, "4");
    var previousRender = previousThunk.render();
    previousThunk.vnode = previousRender;
    assert.equal(previousRender, vnodes[0]);
    assert.equal(renderCount, 1);

    var currentThunk = partial(render, 1, 2, 3, 4);
    var result = currentThunk.render(previousThunk);
    assert.equal(result, vnodes[1]);
    assert.equal(renderCount, 2);
    assert.end();
});
