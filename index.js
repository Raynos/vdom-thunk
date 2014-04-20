var observ = require("observ")
var createElement = require("virtual-dom/create-element")
var diff = require("virtual-dom/diff")
var patch = require("virtual-dom/patch")

function copyOver(list, offset) {
    var newList = []
    for (var i = offset; i < list.length; i++) {
        newList[i - offset] = list[i]
    }
    return newList
}

/*

var Sortable = component(function (localState, arg1, arg2) {
    // localState is the state returned in initialState

    // arg1, arg2, etc are arguments passed in when
    // someone calls Sortable()

}, function initialState() {
    var events = mercury.input([ ... ])
    var state = mercury.hash({
        events: events,
        ...
    })

    // on event mutate this state
    wireupEvents(events, state)

    return state
}, function teardown(state) {
    // state is the observable
    // you best clean up any side effects you set up
    // in initialState
})

*/

module.exports = component

function component(fn, initialState, teardown) {
    return create

    function create() {
        var args = copyOver(arguments, 0)
        var firstArg = args[0]
        var key

        if (typeof firstArg === "object" && firstArg !== null) {
            if ("key" in firstArg) {
                key = firstArg.key
            } else if ("id" in firstArg) {
                key = firstArg.id
            }
        }

        return new LocalThunk(fn, args, key, initialState, teardown)
    }
}

function LocalThunk(fn, args, key, initialState, teardown) {
    this.fn = fn
    this.args = args
    this.localState = null
    this.key = key
    this.initialState = initialState
    this.teardown = teardown
    this.domNodes = null
    this.currentVnode = observ(null)
    this.currentWidget = null
}

LocalThunk.prototype.type = "local-immutable-thunk"
LocalThunk.prototype.init = init
LocalThunk.prototype.update = update
LocalThunk.prototype.destroy = destroy

function shouldUpdate(current, previous) {
    if (current.fn !== previous.fn) {
        return true
    }

    var cargs = current.args
    var pargs = previous.args

    // fast case for args is zero case.
    if (cargs.length === 0 && pargs.length === 0) {
        return false
    }

    if (cargs.length !== pargs.length) {
        return true
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
    var nodes = previous.domNodes.slice()
    if (nodes.indexOf(domNode) === -1) {
        nodes.push(domNode)
    }
    this.domNodes = nodes

    this.currentWidget = previous.currentWidget
    this.localState = previous.localState

    this.currentWidget.set(this)

    if (!shouldUpdate(this, previous)) {
        this.currentVnode.set(previous.currentVnode())
        return
    }

    if (!this.currentVnode()) {
        this.currentVnode.set(this.fn
            .apply(null, [this.localState()].concat(this.args)))
    }

    var patches = diff(previous.currentVnode(), this.currentVnode())
    patch(domNode, patches)
}

function init() {
    this.domNodes = []
    this.localState = this.initialState()
    this.currentVnode.set(this.fn
        .apply(null, [this.localState()].concat(this.args)))
    this.currentWidget = observ(this)

    var self = this
    this.localState(function (newState) {
        var widget = self.currentWidget()

        var prevNode = widget.currentVnode()
        widget.currentVnode.set(widget.fn
            .apply(null, [newState].concat(widget.args)))

        var patches = diff(prevNode, widget.currentVnode())
        for (var i = 0; i < widget.domNodes.length; i++) {
            patch(widget.domNodes[i], patches)
        }
    })

    return createElement(this.currentVnode())
}

function destroy(previous, domNode) {
    // only destroyed in a single location

    // not garaunteed to be destroyed in all locations

    // good luck implementing this without bugs :/
    this.teardown(this.localState, previous, domNode)

    // WE MUTATE THE PROPERTIES OF A WIDGET HERE
    // ALL OTHER MUTATION GOES THROUGH AN OBSERV
    // NO IDEA HOW TO HANDLE CORRECTLY
    var index = this.domNodes.indexOf(domNodes)
    if (index !== -1) {
        this.domNodes.splice(index, 1)
    }
}
