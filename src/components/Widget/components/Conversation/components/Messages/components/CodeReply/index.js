import React, { PureComponent } from 'react';
import { PROP_TYPES } from 'constants';
import AceEditor from 'react-ace';
//import { split as SplitEditor } from "react-ace";
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-monokai';
import 'skulpt/dist/skulpt.min';
import 'skulpt/dist/skulpt-stdlib';

import './styles.scss';

function builtinRead(x)
{
  if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
    throw "File not found: '" + x + "'";
  return Sk.builtinFiles["files"][x];
}

function python_out(output)
{
  console.log('out ' + output)
}

function onChange(newValue) {
  console.log('change', newValue);


  Sk.configure({
    read: builtinRead,
    output: python_out,
    __future__: Sk.python3,
  })
  Sk.misceval.asyncToPromise(() => {
    return Sk.importMainWithBody('<stdin>', false, newValue, true)
  })
    .then(mod => {
      const method = mod.tp$getattr(Sk.ffi.remapToPy('run'));
      //const out = Sk.misceval.call(method, undefined, undefined, undefined, undefined);
      //console.log('out::' + out);
      //return [out, Sk.ffi.remapToJs(out)]
    })
}



class CodeReply extends PureComponent {

  constructor(props) {
    super(props);
    this.state = { seconds: 0 };
  }


  tick() {
    this.setState(state => ({
      seconds: state.seconds + 1
    }));
  }

  componentDidMount() {
    this.interval = setInterval(() => this.tick(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  onChangeNew(newValue) {
    console.log(newValue);
    console.log(CodeReply.state);

    Sk.configure({
      read: builtinRead,
      output: python_out,
      __future__: Sk.python3,
    })
    Sk.misceval.asyncToPromise(() => {
      return Sk.importMainWithBody('<stdin>', false, newValue, true)
    })
      .then(mod => {
        const method = mod.tp$getattr(Sk.ffi.remapToPy('run'));
        //const out = Sk.misceval.call(method, undefined, undefined, undefined, undefined);
        //console.log('out::' + out);
        //return [out, Sk.ffi.remapToJs(out)]
      })
  }

  render() {
    return (
      <div className="rw-video">
        {/*<b className="rw-carousel-card-title">*/}
        {/*  { this.props.message.get('title') }*/}
        {/*</b>*/}
        <div className="rw-carousel-card">
          <a
            className="rw-carousel-card-title"
          >
            {this.props.message.get('title')}
          </a>
          {/*<p className="rw-test">{this.props.message.get('code')}   </p>*/}
          <AceEditor
            mode="python"
            theme="monokai"
            onChange={this.onChangeNew}
            name="UNIQUE_ID_OF_DIV"
            editorProps={{ $blockScrolling: true }}
          />

          <div>
            Output: {this.state.seconds}
          </div>

        </div>

      </div>
    );
  }
}


CodeReply.propTypes = {
  message: PROP_TYPES.CODEREPLY
};

export default CodeReply;

