import 'skulpt/dist/skulpt.min'
import 'skulpt/dist/skulpt-stdlib'

const initPython = () => {
  const externalLibs = {
    './numpy/__init__.js': '/js/skulpt-numpy.js'
  };

  const builtinRead = file => {
    if (externalLibs[file] !== undefined) {
      return Sk.misceval.promiseToSuspension(
        fetch(externalLibs[file]).then(res => {
          return res.text()
        })
      )
    }

    if (Sk.builtinFiles === undefined || Sk.builtinFiles.files[file] === undefined) {
      throw `File not found: ${file}`
    }
    return Sk.builtinFiles.files[file];
  }

  Sk.configure({
    read: builtinRead,
    output: console.log,
    __future__: Sk.python3,
  })
}

const runPython = (codeText) => {

  const pyArgs = Sk.ffi.remapToPy(codeText)

  const fn = `
def run(tests):
  return ${codeText}, ${codeText}`

  return Sk.misceval.asyncToPromise(() => {
    return Sk.importMainWithBody('<stdin>', false, fn, true)
  })
    .then(mod => {
      console.log('mod::', mod)
      //const method = mod.tp$getattr(Sk.ffi.remapToPy('run'))
      //console.log('method::', method)
      //const out = Sk.misceval.call(method, undefined, undefined, undefined, pyArgs)
      //console.log('runPython:: ', out)
      //console.log('runPython remapToJs:: ', Sk.ffi.remapToJs(out))
      //return [out, Sk.ffi.remapToJs(out)]
    })
}

export { initPython, runPython }
