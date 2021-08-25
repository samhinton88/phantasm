const MARK = Symbol('MARK');
const CIRCULAR = Symbol();

const accessProxy = (obj, memo = {}, prevProp='', finalToken = '') => {
    return new Proxy(obj, {
        get(subTarget, prop, receiver) {
            let sub = subTarget;

            if (prop === Symbol.iterator) {
                let count = 0;
                const isFinalArrayDestructure = prevProp === finalToken;

                return function* () {
                    while (true) {
                        const got = Reflect.get(sub, prop, receiver)

                        memo[count] = {}
                        if (isFinalArrayDestructure) {

                        }
                        yield accessProxy({}, memo[count], count, finalToken);

                        count++;
                    }
                }
            }

            const got = Reflect.get(sub, prop, receiver)

            memo[prop] = got || {};

            if (prop === finalToken) {
                throw new Error('Final token ' + finalToken)
            }

            return typeof got === 'object'
                ? accessProxy(got, memo[prop],prop, finalToken) :
                typeof got === 'undefined'
                    ? accessProxy({}, memo[prop],prop, finalToken) :
                    got
                ;
        }
    })
}

const trapFunction = (fn, finalParamToken) => {
    const memo = {};

    const trapped = new Proxy(fn, {
        apply(target, thisArg) {
            const args = new Array(target.length);

            for (let i = 0; i < target.length; i++) args[i] = {};

            args

            Reflect.apply(
                target,
                thisArg,
                accessProxy(args, memo, null, finalParamToken))

        }
    });
    try {
        trapped();
    } catch (e) { 
        console.log(e)
    } finally {
        return memo;
    }

}
const last = arr => arr[arr.length - 1]

const phantasm = fn => {
    const paramString = fn.toString().split('=>')[0].split(' ').join('')
    const lastParamToken = last(paramString.match(/\b(\w+)\W*$/))
    
    const i = paramString.match(new RegExp(lastParamToken)).index;

    console.log(paramString.substr(lastParamToken.length, i).split('').reverse().join(''))

    const countBackToStartBracket = paramString.substr(lastParamToken.length, i).split('').reverse().join('').indexOf('[');
    console.log({ i, countBackToStartBracket })
    console.log(paramString.substr(paramString.length  - countBackToStartBracket - lastParamToken.length, paramString.length - i + lastParamToken.length))
    return trapFunction(fn, lastParamToken);
}

const toGhost = ({ foo: { bar, baz }, '..': { bim: [boo] } }, { blow: [{bum: [bobbies, booties]}] }) => { bum.whatever()};
const toGhostWithArray = ({ foo: [cool, { bimbo: { bango } }] }) => { bango.push()};
const memo = phantasm(toGhost)

// console.log(JSON.stringify(memo, null, 2));
// console.log(toGhost.toString())
const markDependencies = config => {
    const stateDeps = config[0];


}


