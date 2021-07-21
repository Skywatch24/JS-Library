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


## How to use:

Create a POST method on your server.

Take [Express](https://github.com/expressjs/express) as an example.

### For dev needs, you can just copy this code snippet and launch your [Express](https://github.com/expressjs/express) service on the local.
```javascript
const bodyParser = require('body-parser');
const express = require('express');
const skywatchServer = require('@skywatch/server');

const port = 3000;

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
      // method parameter => .Skywatch('the parameter of "feature" from frontend', 'request body from frontend')
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

### Detail 

```javascript
const skywatchServer = require('@skywatch/server');

server.post('/skywatch_api', async (req, res) => {
  try {
    // method parameter => .Skywatch('the parameter of "feature" from frontend', 'request body from frontend')
    const result = await skywatchServer.Skywatch(req.body.feature, req.body);
    res.send(result.data);
  } catch (err) {
    res.status(err.response.status).send(err.response.data);
  }
});

```

