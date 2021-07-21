<h3 align="center">
  Skwatch JS Library
</h3>

<p align="center">
  <a href="https://www.npmjs.com/package/@skywatch/js"><img src="https://img.shields.io/npm/v/@skywatch/js?style=flat-square"></a>
  <a href="https://www.npmjs.com/package/@skywatch/js"><img src="https://img.shields.io/npm/dm/@skywatch/js?style=flat-square"></a>
</p>

## Installation

### Step 1

```
npm install @skywatch/js
```

or

```
yarn add @skywatch/js
```

### Step 2

Before you start developing, you have to implement Skywatch library on your server. Please follow the guide below to create a POST method url on your server, and then keep the POST method url you generated.

Ex. Implement Skywatch Library on node server, and then generate the POST API - https://localhost:3000/skywatch_service_url


#### Guide: 

[Skywatch Server Installation Guide](/packages/server#readme)


## Usage

```javascript
<script src="https://cdn.jsdelivr.net/npm/@skywatch/js/dist/skywatch.min.js"></script>
<div id="root"></div>
<script>
    const options = {
      autoplay: true,
      muted: true,
      aspectRatio: '16:9',
      mobileView: false,
    };
    Skywatch.initialize('/your_server_url_with_skywatch_library', 'token');
    Skywatch.ArchivesPlayer(
      document.getElementById('root'),
      'device_id',
      'archiveId',
      'smart_ff',
      'seek',
      'options',
    ).then(player => {
      //do something
    });
</script>
```

## API Document

### initialize

This is a function which has to initiate at the beginning.

```javascript
import Skywatch from '@skywatch/js';
Skywatch.initialize('/your_server_url_with_skywatch_library', 'token');
```

### ArchivesPlayer

This method is required before using any Skywatch API.

```javascript
<body>
  <div id="YOUR_ID"></div>
</body>
<script>
 Skywatch.ArchivesPlayer(
      ${html_element},
      ${device_id},
      ${archiveId},
      ${smart_ff},
      ${seek},
      ${options},
    ).then(player => {
      //do something
    });
</script>
```

| Property           | Type       | Required | Default                                                                     | Description                                                                                                      |
| ------------------ | ---------- | -------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `html_element`     | `element`  | YES      |                                                                             | A HTML element                                                                                                   |
| `deviceId`         | `string`   | YES      |                                                                             | Decide on which camera is going to play.                                                                         |
| `archiveId`        | `string`   | YES      |                                                                             | Decide on which archive is going to play.                                                                        |
| `smart_ff`         | `number`   | NO       | 0                                                                           | 0 -> close, 1 -> open                                                                                            |
| `seek`             | `number`   | NO       | 0                                                                           | Jump to specific time when video begins to play.                                                                 |
| `options`          | `object`   | NO       | `{ autoplay: true, muted: true, aspectRatio: '16:9', mobileView: false, }`; | Video option setting. For more info please check [Video.js doc](https://docs.videojs.com/tutorial-options.html). |
| `Promise (player)` | `function` |          |                                                                             | A response to allow control of player. For more info please check [Video.js doc](https://docs.videojs.com/#).    |

### FlvPlayer

This is a function for showing live streaming.

```javascript
<body>
  <video id="YOUR_ID" controls muted style="..."></video>
</body>
<script>
 Skywatch.ArchivesPlayer(
      ${video_element},
      ${device_id},
    ).then(player => {
      //do something
    });
</script>
```

| Property           | Type       | Required | Default | Description                                                                                                                                 |
| ------------------ | ---------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `video_element`    | `element`  | YES      |         | A HTML video element                                                                                                                        |
| `deviceId`         | `string`   | YES      |         | Decide on which camera is going to play.                                                                                                    |
| `Promise (player)` | `function` |          |         | A response to allow control of player. For more info please check [flv.js doc](https://github.com/bilibili/flv.js/edit/master/docs/api.md). |

## License

- This project is inspired by [video.js](https://www.videojs.com).
- This project is inspired by [flv.js](https://github.com/Bilibili/flv.js/).
- Licensed under the Apache License, Version 2.0 (the "License");
