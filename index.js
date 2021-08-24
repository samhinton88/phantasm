const MARK = Symbol('MARK')

const accessProxy = (obj, memo = {}) => {
    return new Proxy(obj, {
        get(subTarget, prop, receiver) {
            let sub = subTarget;

            if (prop === Symbol.iterator) {
                let count = 0

                return function* () {
                    while (true) {
                        const got = Reflect.get(sub, prop, receiver)

                        memo[count] = {}
                        yield accessProxy({}, memo[count]);

                        count++;
                    }
                }
            }

            const got = Reflect.get(sub, prop, receiver)

            memo[prop] = got || {};

            return typeof got === 'object'
                ? accessProxy(got, memo[prop]) :
                typeof got === 'undefined'
                    ? accessProxy({}, memo[prop]) :
                    got
                ;
        }
    })
}

const trapFunction = (fn) => {
    const memo = {};
    const trapped = new Proxy(fn, {
        apply(target, thisArg) {
            const args = new Array(target.length);

            for (let i = 0; i < target.length; i++) args[i] = {};

            Reflect.apply(
                target,
                thisArg,
                accessProxy(args, memo))

        }
    });

    trapped();

    return memo;
}

const phantasm = fn => {
    return trapFunction(fn);
}

const toGhost = ({ foo: { bar, baz }, '..': { bim: [boo] } }, { blow }) => { };
const toGhostWithArray = ({ foo: [cool, { bimbo: { bango } }] }) => { };
const memo = phantasm(toGhostWithArray)

console.log(JSON.stringify(memo, null, 2));
console.log(toGhost.toString())
const markDependencies = config => {
    const stateDeps = config[0];


}


