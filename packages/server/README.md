<h3 align="center">
  Skwatch API Server
</h3>

<p align="center">
  <a href="https://www.npmjs.com/package/@skywatch/server"><img src="https://img.shields.io/npm/v/@skywatch/server?style=flat-square"></a>
  <a href="https://www.npmjs.com/package/@skywatch/server"><img src="https://img.shields.io/npm/dm/@skywatch/server?style=flat-square"></a>
</p>

## Installation

```
npm install @skywatch/server
```

or

```
yarn add @skywatch/server
```


## Usage

Add a POST method into your server. Take [Express](https://github.com/expressjs/express) as an example:

```
const SkywatchServer = require('@skywatch/server'); 
 
// add skywatch api library into a new route
server.post('/skywatch_api', async (req, res) => {
  try {
    const result = await SkywatchServer.Skywatch(req.body.feature, req.body);
    res.send(result.data);
  } catch (err) {
    res.status(err.response.status).send(err.response.data);
  }
});
```
