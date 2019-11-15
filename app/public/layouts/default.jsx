var React = require('react');

class DefaultLayout extends React.Component {
  render() {
    return (
        <html>
        <head>
          <title>{this.props.title}</title>
          <meta charSet="utf-8"></meta>
          <link rel="stylesheet" href={this.props.styleFile}></link>
        </head>
        <body>{this.props.children}</body>
        </html>
    );
  }
}

module.exports = DefaultLayout;
