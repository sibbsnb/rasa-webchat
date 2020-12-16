import React, { PureComponent, useContext } from 'react';
import { PROP_TYPES } from 'constants';
import AceEditor from 'react-ace';
// import { split as SplitEditor } from "react-ace";
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/theme-solarized_light';
import 'skulpt/dist/skulpt.min';
import 'skulpt/dist/skulpt-stdlib';

import './styles.scss';

import { addUserMessage, emitUserMessage, setButtons, toggleInputDisabled, changeInputFieldHint } from 'actions';
import ThemeContext from '../../../../../../ThemeContext';

import { initPython, runPython } from './python';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

function builtinRead(x) {
  if (Sk.builtinFiles === undefined || Sk.builtinFiles.files[x] === undefined) {
    throw `File not found: '${x}'`;
  }
  return Sk.builtinFiles.files[x];
}

class CodeReply extends PureComponent {
  constructor(props) {
    super(props);
    this.onChangeNew = this.onChangeNew.bind(this);
    this.pythonOutNew = this.pythonOutNew.bind(this);
    this.state = { seconds: 0, output: '', output_title: 'Output', code: '', code_output: '', code_matched: false, expected_code: props.message.toJS().code[0].expected_code, validate_code: props.message.toJS().code[0].validate_code, validation_type: props.message.toJS().code[0].validation_type };
    initPython();

    console.log(`props.message:: ${props.message}`);

    // eslint-disable-next-line camelcase

    // const { mainColor, assistTextColor } = useContext(ThemeContext);
  }


  tick() {
    this.setState(state => ({
      seconds: state.seconds + 1
    }));
  }

  componentDidMount() {
    // const expected_code = this.props.message.toJS().code[0]['expected_code'];
    // /console.log('expected_code ' +  expected_code)
    // this.setState({ expected_code });
    // console.log(this.state.expected_code);
    // this.interval = setInterval(() => this.tick(), 1000);
    let expected_code_temp = this.state.expected_code;
    console.log('expected_code_temp ', expected_code_temp);
    if (expected_code_temp) {
      expected_code_temp = expected_code_temp.replace(/\\n/g, '\n');
      this.setState({ expected_code: expected_code_temp });
    }
    console.log('expected_code_temp after', expected_code_temp);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  pythonOutNew(output) {
    console.log(`Code output new ${output}`);
    output = `${this.state.output}${output}`;
    const code_output = output;
    this.setState({ output });
    this.setState({ code_output });
    console.log(`Code output after ${this.state.output}`);
    // const expected = this.props.message.get('code'.trim());

    // eslint-disable-next-line camelcase
    // eslint-disable-next-line camelcase
    const code_buttons = this.props.message.toJS();
    // eslint-disable-next-line camelcase
    console.log(`code_buttons ${this.props.message.toJS().code[0]}`);
    console.log(this.props.message.toJS().code[0]);
    const expected = code_buttons.code[0].expected_output.trim();
    console.log(code_buttons.code[0].expected_output);
    console.log(`expected ${expected}`);
    console.log(`expected_code ${this.props.message.toJS().code[0].expected_code}`);
    console.log(`validate_code ${this.props.message.toJS().code[0].validate_code}`);
    console.log(`validation_type ${this.props.message.toJS().code[0].validation_type}`);
    const validationType = this.props.message.toJS().code[0].validation_type;

    console.log(`debug match ${output.trim().includes(expected)}`);

    if (validationType === 'single_answer' && output.trim() === expected) {
      console.log('result matched');
      this.setState({ output_title: 'Output matches' });
      this.setState({ code_matched: true });
    } else if (validationType === 'single_contains' && output.trim().includes(expected)) {
      this.setState({ output_title: 'Output matches' });
      this.setState({ code_matched: true });
    } else {
      this.setState({ output_title: 'Output doesn\'t match' });
    }
  }


  onChangeNew(newValue) {
    this.state.output = '';
    console.log(newValue);
    console.log(CodeReply.state);
    console.log('props message during onChangeNew');
    this.setState({ code: newValue });
    // console.log(this.props.message[3][1][4][1][2])
    // console.log(this.props.message[3])

    Sk.configure({
      read: builtinRead,
      output: this.pythonOutNew,
      __future__: Sk.python3
    });
    Sk.misceval.asyncToPromise(() => Sk.importMainWithBody('<stdin>', false, newValue, true))
      .then((mod) => {
        // const expected = this.props.message.get('code');
        // console.log('expected fulfilled' + expected);
        // console.log('Code output fulfilled ' + this.state.output);
        // console.log('mod1::', mod);
        // const method = mod.tp$getattr(Sk.ffi.remapToPy('run'));
        // const out = Sk.misceval.call(method, undefined, undefined, undefined, undefined);
        // console.log('out new1 ' + out);
        // console.log('out::' + out);
        // return [out, Sk.ffi.remapToJs(out)]
      });
  }

  handleClick = (action) => {
    console.log(action);
    if (!action || action.type !== 'postback') return;
    const {
      chooseReply,
      id
    } = this.props;

    const payload = action.payload;
    console.log('handleClick::');
    console.log(payload);

    // /goodbye{"trivia_user_answer:": "code"}

    // /code_submitted{"code:": "print("hello")" , "code_output":"10"}

    // eslint-disable-next-line camelcase
    const { code, code_output, code_matched } = this.state;
    // eslint-disable-next-line camelcase
    const payload_temp = `${payload}{"code:": "${JSON.stringify(code).replace(/"/g, '\\\"')}" , "code_output":"${JSON.stringify(code_output).replace(/"/g, '\\\"')}", "code_matched": ${code_matched}}`;
    console.log(payload_temp);

    const title = action.title;
    chooseReply(payload_temp, title, id);
  };


  render() {
    const { showButton } = true;
    return (
      <div className="rw-code-container">
        {/* <b className="rw-carousel-card-title"> */}
        {/*  { this.props.message.get('title') } */}
        {/* </b> */}
        <div className="rw-code-card">
          <a className="rw-code-card-title">
            {this.props.message.get('title')}
          </a>

          {/* <p className="rw-test">{this.props.message.get('code')}   </p> */}
          {/* <AceEditor
            mode="python"
            theme="clouds"
            fontSize="16"
            showPrintMargin="false"
            showGutter="false"
            highlightActiveLine="false"
            onChange={this.onChangeNew}
            name="UNIQUE_ID_OF_DIV"
            editorProps={{ $blockScrolling: false }}
            setOptions={{
              enableBasicAutocompletion: false,
              enableLiveAutocompletion: false,
              enableSnippets: false,
              showLineNumbers: false,
              tabSize: 2,
              cursorStyle: 'wide'
            }}
          /> */}
          <div className="rw-code-card-block">
            <AceEditor
              placeholder=""
              defaultValue={this.state.expected_code}
              value={this.state.expected_code}
              // defaultValue={this.props.message.toJS().code[0]['expected_code']}
              mode="python"
              theme="monokai"
              name="python_window"
              onLoad={this.onLoad}
              height={324}
              width={'439'}
              onChange={this.onChangeNew}
              fontSize={16}
              showPrintMargin
              showGutter
              highlightActiveLine
              focus
              wrapEnabled
              setOptions={{
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                enableSnippets: false,
                showLineNumbers: true,
                tabSize: 2
              }}
            />
          </div>

          {this.props.message.toJS().code[0].buttons && <div className="rw-carousel-buttons-container">
            <div
              key={0}
              className="rw-reply"
              onClick={() => this.handleClick(this.props.message.toJS().code[0].buttons[0])}
              role="button"
              tabIndex={0}
              style={{ borderColor: '#ffffff', color: '#ffffff', 'background-color': 'darkgreen', 'border-color': 'darkgreen' }}
            >
              <span>{'submit answer'}</span>
            </div>
          </div>}


        </div>

        <div className="rw-code-output-card">
          <a className="rw-code-output-card-title">
            {this.state.output_title}
          </a>
          <div className="rw-code-card-block">
            <AceEditor
              placeholder=""
              defaultValue={this.props.message.toJS().code[0].display_output}
              // defaultValue={ "cow = 100\nprint(cow)"}
              mode="html"
              theme="solarized_light"
              name="output_window"
              editorProps={{ $blockScrolling: false }}
              onLoad={this.onLoad}
              // onChange={this.onChangeNew}
              fontSize={16}
              height={324}
              width={'339'}
              showPrintMargin={false}
              showGutter={false}
              highlightActiveLine={false}
              value={this.state.output}
              readOnly
              wrapEnabled
              cursorStart={0}
              setOptions={{
                enableBasicAutocompletion: false,
                enableLiveAutocompletion: false,
                enableSnippets: false,
                showLineNumbers: false,
                tabSize: 2
              }}
            />
          </div>
        </div>

      </div>


    );
  }
}


CodeReply.propTypes = {
  message: PROP_TYPES.CODEREPLY,
  chooseReply: PropTypes.func.isRequired,
  id: PropTypes.number
};

const mapDispatchToProps = dispatch => ({
  toggleInputDisabled: () => dispatch(toggleInputDisabled()),
  changeInputFieldHint: hint => dispatch(changeInputFieldHint(hint)),
  chooseReply: (payload, title, id) => {
    dispatch(setButtons(id, title));
    dispatch(addUserMessage(title));
    dispatch(emitUserMessage(payload));
    // dispatch(toggleInputDisabled());
  }
});

const mapStateToProps = state => ({

});


export default connect(mapStateToProps, mapDispatchToProps)(CodeReply);

