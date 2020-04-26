import React, { PureComponent } from 'react';
import { CFrame4 } from './components/CFrame4';
import { CProject2frame1 } from './components/CProject2frame1';
import { Cnewname } from './components/Cnewname';

export class MasterFrame4 extends PureComponent {
  render() {
    return <div className="master" style={{backgroundColor: "rgba(255, 255, 255, 1)"}}>
      <CFrame4 {...this.props} nodeId="4:12" />
    </div>
  }
}

export class MasterProject2frame1 extends PureComponent {
  render() {
    return <div className="master" style={{backgroundColor: "rgba(255, 255, 255, 1)"}}>
      <CProject2frame1 {...this.props} nodeId="16:0" />
    </div>
  }
}

export class Masternewname extends PureComponent {
  render() {
    return <div className="master" style={{backgroundColor: "rgba(255, 0, 0, 1)"}}>
      <Cnewname {...this.props} nodeId="9:0" />
    </div>
  }
}

export function getComponentFromId(id) {
  if (id === "4:12") return CFrame44D12;
  if (id === "16:0") return CProject2frame116D0;
  if (id === "9:0") return Cnewname9D0;
  return null;
}

class CFrame44D12 extends PureComponent {
  render() {
    return (
      <div>
        <div style={{"zIndex":3}} className="outerDiv">
          <div
            id="4:16"
            style={{"marginLeft":42,"width":58,"minWidth":58,"height":null,"marginTop":32,"marginBottom":674,"minHeight":14,"color":"rgba(0, 0, 0, 1)","fontSize":12,"fontWeight":400,"fontFamily":"Roboto","textAlign":"LEFT","fontStyle":"normal","lineHeight":"125%","letterSpacing":"0px"}}
            className="innerDiv"
          >
            <div>
              <span style={{}} key="end">Hello there </span>
            </div>
          </div>
        </div>
        <div style={{"justifyContent":"flex-end"}} className="outerDiv">
          <div
            id="21:2"
            style={{"marginRight":25,"width":128,"minWidth":128,"height":null,"marginTop":-562,"marginBottom":484,"minHeight":78,"backgroundColor":"rgba(196, 196, 196, 1)"}}
            className="innerDiv"
          >
            <div>
              <div style={{}} className="outerDiv">
                <div
                  id="21:0"
                  style={{"marginLeft":13,"width":91,"minWidth":91,"height":null,"marginTop":11,"marginBottom":51,"minHeight":16,"color":"rgba(0, 0, 0, 1)","fontSize":14,"fontWeight":700,"fontFamily":"Roboto","textAlign":"LEFT","fontStyle":"normal","lineHeight":"125%","letterSpacing":"0px"}}
                  className="innerDiv"
                >
                  <div>
                    <span style={{}} key="end">Inside another</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{"zIndex":1}} className="outerDiv">
          <div
            id="4:14"
            style={{"marginLeft":140,"width":133,"minWidth":133,"height":null,"marginTop":-386,"marginBottom":234,"minHeight":152,"backgroundColor":"rgba(155, 81, 224, 1)"}}
            className="innerDiv"
          >
            <div>
            </div>
          </div>
        </div>
        <div style={{"zIndex":2}} className="outerDiv">
          <div
            id="4:15"
            style={{"marginLeft":33,"width":133,"minWidth":133,"height":null,"marginTop":-209,"marginBottom":57,"minHeight":152,"backgroundColor":"rgba(235, 87, 87, 1)"}}
            className="innerDiv"
          >
            <div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class CProject2frame116D0 extends PureComponent {
  render() {
    return (
      <div>
        <div style={{}} className="outerDiv">
          <div
            id="16:1"
            style={{"marginLeft":85,"width":126,"minWidth":126,"height":null,"marginTop":222,"marginBottom":372,"minHeight":126}}
            className="innerDiv"
          >
            <div className="vector" dangerouslySetInnerHTML={{__html: `<svg preserveAspectRatio="none" width="126" height="126" viewBox="0 0 126 126" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="63" cy="63" r="63" fill="#56CCF2"/>
</svg>
`}} />
          </div>
        </div>
      </div>
    );
  }
}

class Cnewname9D0 extends PureComponent {
  render() {
    return (
      <div>
        <div style={{}} className="outerDiv">
          <div
            id="9:4"
            style={{"marginLeft":46,"width":267,"minWidth":267,"height":null,"marginTop":44,"marginBottom":613,"minHeight":63,"color":"rgba(0, 0, 0, 1)","fontSize":54,"fontWeight":700,"fontFamily":"Roboto","textAlign":"LEFT","fontStyle":"normal","lineHeight":"125%","letterSpacing":"0px"}}
            className="innerDiv"
          >
            <div>
              <span style={{}} key="end">Hello there </span>
            </div>
          </div>
        </div>
        <div style={{"zIndex":2}} className="outerDiv">
          <div
            id="12:3"
            style={{"marginLeft":18,"width":288,"minWidth":288,"height":null,"marginTop":-507,"marginBottom":333,"minHeight":174,"backgroundImage":"url(https://s3-us-west-2.amazonaws.com/figma-alpha/img/1a0d/8092/b641474d17a2ebdc6a4ff8cea70cdef1)","backgroundSize":"cover"}}
            className="innerDiv"
          >
            <div>
            </div>
          </div>
        </div>
        <div style={{}} className="outerDiv maxer">
          <div
            id="9:0"
            style={{"backgroundColor":null,"overflow":"hidden","width":"100%","pointerEvents":"none"}}
            className="innerDiv"
          >
            <div style={{"zIndex":1,"justifyContent":"flex-end"}} className="outerDiv">
              <div
                id="9:5"
                style={{"marginRight":28.949676513671875,"width":169.10067749023438,"minWidth":169.10067749023438,"height":null,"marginTop":524.1375732421875,"marginBottom":26.137557983398438,"minHeight":169.72486877441406,"backgroundColor":"rgba(196, 196, 196, 1)"}}
                className="innerDiv"
              >
                <div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

