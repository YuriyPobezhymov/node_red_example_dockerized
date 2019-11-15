# Node Red service example and app that uses it built with Docker
Quadratic equation logic built with Node Red and exposed as API service.
App built with express.js that uses the service have two data sources:
- [`Mongo database`](https://www.mongodb.com)
- HTML file that contains equations and parsed with [`puppeteer`](https://github.com/GoogleChrome/puppeteer) 
## Getting started
To run the example you need to have [`Docker`](https://docs.docker.com/install) and [`Docker Compose`](https://docs.docker.com/compose/install) installed.
### Build
To build the example with Docker Compose you need to run (choose production or development version):
```
 docker-compose -f docker-compose.{prod|dev}.yml build
```
### Run
To run example you need to start all services provided by Docker Compose:
```
 docker-compose -f docker-compose.{prod|dev}.yml up
```
Then you can access the app via http://0.0.0.0:8080, to get access to Node Red editor use http://127.0.0.1:1880.

### Objective
Published for educational purpose. 
