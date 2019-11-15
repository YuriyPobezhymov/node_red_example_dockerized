'use strict';

const express = require('express');
const url = require('url');
const MongoClient = require('mongodb').MongoClient;
const puppeteer = require("puppeteer");
const r2 = require('r2');

const React = require("react");
const ReactEngine = require('express-react-views');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';
const collection_name = "quadratic_equation_params";
// App
const app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/public');
app.set('view engine', 'jsx');
app.engine('jsx', ReactEngine.createEngine());

var db;
MongoClient.connect('mongodb://db:27017', { useUnifiedTopology: true }, (err, client) => {
  if(err) throw err;
  else {
    console.log("Connected successfully to server");
    db = client.db('node_red_example_dockerized');
  }
});

async function requestBatchCalc(items, batch_size = 5) {
  const request_uri = 'http://node-red:1880/quadratic-equation';
  var items_calculated = [];
  for (var i=0;i<items.length/batch_size;i++) {
    const _items = items.slice(i * batch_size, (i + 1) * batch_size);
    var request_promises = [];
    for(var _item of _items) {
      request_promises.push(r2.post(request_uri, {json: _item}).json);
    }
    const _responses = await Promise.all(request_promises);
    items_calculated = items_calculated.concat(_responses);
  }
  return items_calculated;
}

async function equationsMain(req, res) {
  var page_params = {
    title: "Quadratic equations",
    list_title: "Quadratic equations loaded from Mongo database:",
    puppeteer_title: "Quadratic equations crawled from the page below via Puppeteer:",
    url_to_crawl: req.protocol + '://' + req.headers.host + url.parse(req.url).pathname + 'crawler_test',
    form_title: "Submit quadratic equation parameters:",
    empty_collection: "No quadratic equation defined. Please add new.",
    empty_result: "No roots"
  };

  if (req.error_message) {
    page_params['error_message'] = req.error_message;
  }

  const request_crawl_uri = req.query.url_to_crawl ? req.query.url_to_crawl : page_params.url_to_crawl;

  await Promise.all([
    new Promise( (resolve, reject) => {
      db.collection(collection_name).find().toArray(async (err, items) => {
        resolve(await requestBatchCalc(items));
      });
    }),
    new Promise( async (resolve, reject) => {
      const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
      const page = await browser.newPage();
      await page.goto(request_crawl_uri);
      const _crawled_equations = await page.$$('ul.quadratic-equations li');

      var crawled_equations = [];
      for (var crawled_equation of _crawled_equations) {
        crawled_equations.push(await page.evaluate(el => el.innerHTML, crawled_equation));
      }
      await browser.close();

      var items = [], symbols = ['x^2', 'x', undefined];
      for (var crawled_equation of crawled_equations) {
        crawled_equation = crawled_equation.replace(/ /g, '');
        crawled_equation = crawled_equation.substr(0, crawled_equation.length - 2);
        var parsed_crawled_equation = [...crawled_equation.matchAll(/(-?(?:\d+)?(?:\.)?\d+)(x(?:\^2)?)?/g)];
        if (parsed_crawled_equation.length != 3)
          continue;
        parsed_crawled_equation.sort((a, b) => symbols.indexOf(a[2]) > symbols.indexOf(b[2]));
        items.push({'a': parsed_crawled_equation[0][1], 'b': parsed_crawled_equation[1][1], 'c': parsed_crawled_equation[2][1]});
      }

      resolve(await requestBatchCalc(items));
    })
  ]).then((items_calculated) =>
      res.render('root.jsx', {...page_params, ...{equations: items_calculated[0]}, ...{equations2: items_calculated[1]}}));
}

app.get('/', equationsMain);

app.post('/', (req, res, next) => {
  var available_params = ['a', 'b', 'c'];
  var invalid_form = false;
  if (Object.keys(req.body.params).length != available_params.length) {
    invalid_form = true;
  }
  else {
    for (var [index, value] of Object.entries(req.body.params)) {
      if (!(available_params.includes(index) && /^([-+]?[0-9]+\.)?[0-9]+$/.test(value))) {
        invalid_form = true;
        break;
      }
    }
  }

  if (!invalid_form) {
    db.collection(collection_name).insertOne(req.body.params, (err, items) => {
      res.redirect('/');
    });
  }
  else {
    req.error_message = 'Parameters (only a, b, c) must be int/float.';
    return next();
  }
}, equationsMain);

app.get('/crawler_test', (req, res, next) => {
  res.sendFile(__dirname + '/public/crawler_test.html');
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
