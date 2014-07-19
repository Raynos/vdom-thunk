import { VElem, VThunk } from "vtree"

vdom-thunk/immutable-thunk : (
    fn: (...args: Any) => VElem,
    args: Array<Any>,
    key: String | null,
    eqFn: (Array<Any>, Array<Any>) => Boolean
) => VThunk

vdom-thunk/partial : (
    eq: (Array<Any>, Array<Any>) => Boolean
) => (fn: () => VElem, ...args: Any) => VThunk

vdom-thunk : (fn: () => VElem, ...args: Any) => VThunk
