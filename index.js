var createElement = require("virtual-dom/create-element")
var diff = require("virtual-dom/diff")
var patch = require("virtual-dom/patch")

function copyOver(list, offset) {
    var newList = []
    for (var i = offset; i < list.length; i++) {
        newList[i] = list[i]
    }
    return newList
}

module.exports = partial

function partial(fn) {
    var args = copyOver(arguments, 1)
    var firstArg = args[0]
    var key

    if (typeof firstArg === "object" && firstArg !== null) {
        if ("key" in firstArg) {
            key = firstArg.key
        } else if ("id" in firstArg) {
            key = firstArg.id
        }
    }

    return new Thunk(fn, args, key)
}

function Thunk(fn, args, key) {
    this.fn = fn
    this.args = args
    this.vnode = null
    this.key = key
}

Thunk.prototype.type = "immutable-thunk"
Thunk.prototype.update = update
Thunk.prototype.init = init

function shouldUpdate(current, previous) {
    if (current.fn !== previous.fn) {
        return true
    }

    var cargs = current.args
    var parcs = previous.args

    // fast case length comparison. Works for `length = 0` too
    if (cargs.length === pargs.length) {
        return false
    }

    var max = cargs.length > pargs.length ? cargs.length : pargs.length

    for (var i = 0; i < max; i++) {
        if (cargs[i] !== pargs[i]) {
            return true
        }
    }

    return false
}

function update(previous, domNode) {
    if (!shouldUpdate(this, previous)) {
        this.vnode = previous.vnode
        return
    }

    if (!this.vnode) {
        this.vnode = this.fn.apply(null, this.args)
    }

    patch(domNode, diff(previous.vnode, this.vnode))
}

function init() {
    this.vnode = this.fn.apply(null, this.args)
    return createElement(this.vnode)
}
