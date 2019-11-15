const React = require("react");
const DefaultLayout = require('./layouts/default');
const Equations = require('./equation');

class Root extends React.Component {
  render() {
    return (
        <DefaultLayout title={this.props.title} styleFile='/root.css'>
          <b>1. {this.props.list_title}</b><hr/>
          <Equations {...this.props} index="equations"/>
          <form action="/" method="post">
            <b>{this.props.form_title}</b><br/>
            <input name="params[a]" placeholder="a" size="2"></input>
            <input name="params[b]" placeholder="b" size="2"></input>
            <input name="params[c]" placeholder="c" size="2"></input>
            <input type="submit" value="Ok!"></input>
          </form>
          <div className="error">{this.props.error_message}</div>
          <br/>
          <b>2. {this.props.puppeteer_title}</b><hr/>
          <form action="/">
            <input name="url_to_crawl" type="url" placeholder={this.props.url_to_crawl} size="35" />
            <input type="submit" value="Ok!"></input>
          </form>
          <Equations {...this.props} index="equations2"/>
        </DefaultLayout>
    )
  }
}

module.exports = Root;
