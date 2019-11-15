const React = require("react");
const NumberFormat = require('react-number-format');

class Equation extends React.Component {
  render() {
    return (
        <li>
          {this.props.data.a != 1 ? this.props.data.a: ''}x^2 + {this.props.data.b != 1 ? this.props.data.b: ''}x + {this.props.data.c} = 0
          => Calculated: D = <NumberFormat displayType="text" decimalScale={2} value={this.props.data.D} />,
          roots = {this.props.data.result.length ? this.props.data.result.map((root, root_index) => {
          return (<NumberFormat key={root_index} displayType="text" decimalScale={2} value={root} suffix={root_index<this.props.data.result.length-1 ? ", ": ""} />)
        }): this.props.empty_result}
        </li>
    );
  }
}

class Equations extends React.Component {
  render() {
    const equations = this.props[this.props.index];
    const listItems = equations.map((value, index) =>
        <Equation key={index.toString()} data={value} empty_result={this.props.empty_result}/>
    );

    return equations.length ?
        (<ul>{listItems}</ul>): this.props.empty_collection;
  }
}

module.exports = Equations;
