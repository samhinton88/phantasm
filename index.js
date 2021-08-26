const isEmptyObject = (obj) =>
  obj && // 👈 null and undefined check
  Object.keys(obj).length === 0 &&
  obj.constructor === Object;

const nullified = (config) => {
  Object.keys(config).forEach((key) => {
    if (isEmptyObject(config[key])) {
      config[key] = null;
    } else {
      nullified(config[key]);
    }
  });

  return config;
};

const accessProxy = (obj, memo = {}, prevProp = "", options = {}) => {
  return new Proxy(obj, {
    get(subTarget, prop, receiver) {
      let sub = subTarget;

      if (prop === Symbol.iterator) {
        let count = 0;
        const isFinalArrayDestructure =
          prevProp === options.firstIdentifierBeforeArrayDestructure;

        return function* () {
          while (true) {
            memo[count] = {};
            if (isFinalArrayDestructure) {
              if (options.lastArrayDestructureLength - 1 === count) {
                throw new Error();
              }
            }
            yield accessProxy({}, memo[count], count, options);

            count++;
          }
        };
      }

      const got = Reflect.get(sub, prop, receiver);

      memo[prop] = got || {};

      if (prop === options.finalParamToken) {
        throw new Error("Final token " + options.finalParamToken);
      }

      return typeof got === "object"
        ? accessProxy(got, memo[prop], prop, options)
        : typeof got === "undefined"
        ? accessProxy({}, memo[prop], prop, options)
        : got;
    },
  });
};

const trapFunction = (fn, options) => {
  const memo = {};

  const trapped = new Proxy(fn, {
    apply(target, thisArg) {
      const args = new Array(target.length);

      for (let i = 0; i < target.length; i++) args[i] = {};

      Reflect.apply(target, thisArg, accessProxy(args, memo, null, options));
    },
  });
  try {
    trapped();
  } catch (e) {
    // console.log(e)
  } finally {
    return memo;
  }
};
const last = (arr) => arr[arr.length - 1];

const parsedParamConfig = (paramString) => {
    const options = { };
    const lastParamToken = last(paramString.match(/\b(\w+)\W*$/));
    options.lastParamToken = lastParamToken;
    const i = paramString.match(new RegExp(lastParamToken)).index;


    const lastParamTokenIsPartOfArrayDestructure =
        paramString[lastParamToken.length + i] === "]";

  if (lastParamTokenIsPartOfArrayDestructure) {
    options.lastParamTokenIsPartOfArrayDestructure = true;
    const countBackToStartBracket = paramString
      .substr(lastParamToken.length, i)
      .split("")
      .reverse()
      .join("")
      .indexOf("[");

    const arrayDestructureStart =
      paramString.length - countBackToStartBracket - lastParamToken.length + 1;
    const arrayDestructureEnd =
      paramString.length - i + lastParamToken.length - 2;

    const firstIdentifierBeforeArrayDestructure = last(
      paramString.substr(0, arrayDestructureStart).match(/\b(\w+)\W*$/)
    );

    const lastArrayDestructureLength = paramString
      .substr(arrayDestructureStart, arrayDestructureEnd)
      .split(",").length;

    options.lastArrayDestructureLength = lastArrayDestructureLength;
    options.firstIdentifierBeforeArrayDestructure =
      firstIdentifierBeforeArrayDestructure;
  }

  return options
}

const isolatedParamStringFrom = fn => {
    return fn.toString().split("=>")[0].split(" ").join("");
}

const phantasm = (fn) => {
  const paramString = isolatedParamStringFrom(fn);
  const options = parsedParamConfig(paramString);

  return nullified(trapFunction(fn, options));
};

module.exports = phantasm;
