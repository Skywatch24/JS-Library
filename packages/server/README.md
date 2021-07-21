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
const bodyParser = require('body-parser');
const express = require('express');
const skywatchServer = require('@skywatch/server');

const port =  Number(process.env.PORT) || 3000;

app.prepare().then(() => {
  const server = express();
  
  const verify = (req, _, buf) => {
    req.rawBody = buf.toString();
  };
  server.use(bodyParser.json({ verify }));
  server.use(bodyParser.urlencoded({ extended: false, verify }));

  // skywatch api library
  server.post('/skywatch_api', async (req, res) => {
    try {
      const result = await skywatchServer.Skywatch(req.body.feature, req.body);
      res.send(result.data);
    } catch (err) {
      res.status(err.response.status).send(err.response.data);
    }
  });

  server.listen(port, (err) => {
    if (err) return console.log(`Something bad happened: ${err}`);
    console.log(`Node.js server listening on ${port}`);
  });
});




```
