function Thunk(fn, args, key, eqFn) {
    this.fn = fn;
    this.args = args;
    this.key = key;
    this.eqFn = eqFn;
}

Thunk.prototype.type = 'Thunk';
Thunk.prototype.render = render;

module.exports = Thunk;

function shouldUpdate(current, previous) {
    if (!current || !previous || current.fn !== previous.fn) {
        return true;
    }

    var cargs = current.args;
    var pargs = previous.args;

    return !current.eqFn(cargs, pargs);
}

function render(previous) {
    if (shouldUpdate(this, previous)) {
        return this.fn.apply(null, this.args);
    } else {
        return previous.vnode;
    }
}
