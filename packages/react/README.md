<h3 align="center">
  Skwatch React Library
</h3>

<p align="center">
  <a href="https://www.npmjs.com/package/@skywatch/react"><img src="https://img.shields.io/npm/v/@skywatch/react?style=flat-square"></a>
  <a href="https://www.npmjs.com/package/@skywatch/react"><img src="https://img.shields.io/npm/dm/@skywatch/react?style=flat-square"></a>
</p>

## Installation

### Step 1

```
npm install @skywatch/react
```

or

```
yarn add @skywatch/react
```

### Step 2

Before you start developing, you have to implement Skywatch library on your server. Please follow the guide below to create a POST method url on your server, and then keep the POST method url you generated.

Ex. Implement Skywatch library on node server, and then generate the POST API - https://localhost:3000/skywatch_service_url


#### Guide: 

[Skywatch Server Installation Guide](/packages/server#readme)

## Usage

```javascript
import React, {useState, useEffect} from 'react';
import {ArchivesPlayer, initialize} from '@skywatch/react';

const APP = () => {
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    initialize('/your_server_url_with_skywatch_library', 'token');
  }, []);

  const options = {
    autoplay: true,
    muted: true,
    aspectRatio: '16:9',
    mobileView: false,
  };

  return (
    <ArchivesPlayer
      onPlayerInit={setPlayer}
      onPlayerDispose={setPlayer}
      deviceId={'1234'}
      archiveId={'123456'}
      smart_ff={0}
      seek={0}
      playerOptions={options}
    />
  );
};
```

## API Document

### initialize

This method is required before using any Skywatch API.

```javascript
import Skywatch from '@skywatch/react';

Skywatch.initialize('/your_server_url_with_skywatch_library', 'token');
```

### ArchivesPlayer

This is a component for playing archive video.

```javascript
<ArchivesPlayer
  onPlayerInit={}
  onPlayerDispose={}
  deviceId={}
  archiveId={}
  smart_ff={}
  seek={}
  playerOptions={}
  style={}
/>
```

| Property          | Type           | Required | Default                                                                     | Description                                                                                                               |
| ----------------- | -------------- | -------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `onPlayerInit`    | `function`     | YES      |                                                                             | Pass state into player to allow control of player. For more info please check [Video.js doc](https://docs.videojs.com/#). |
| `onPlayerDispose` | `Function`     | YES      |                                                                             | Pass state into player to dispose when video is released.                                                                 |
| `deviceId`        | `string`       | YES      |                                                                             | Decide on which camera is going to play.                                                                                  |
| `archiveId`       | `string`       | YES      |                                                                             | Decide on which archive is going to play.                                                                                 |
| `smart_ff`        | `number`       | NO       | 0                                                                           | 0 -> close, 1 -> open                                                                                                     |
| `seek`            | `number`       | NO       | 0                                                                           | Jump to specific time when video begins to play.                                                                          |
| `playerOptions`   | `object`       | NO       | `{ autoplay: true, muted: true, aspectRatio: '16:9', mobileView: false, }`; | Video option setting. For more info please check [Video.js doc](https://docs.videojs.com/tutorial-options.html).          |
| `style`           | `inline-style` | NO       |                                                                             | Custom style for video player.                                                                                            |

### FlvPlayer

This is a component for playing live streaming.

```javascript
<FlvPlayer deviceId={} onPlayerInit={} onPlayerDispose={} style={} />
```

| Property          | Type           | Required | Default | Description                                                                                                                                             |
| ----------------- | -------------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `deviceId`        | `string`       | YES      |         | Decide on which camera is going to play.                                                                                                                |
| `onPlayerInit`    | `function`     | YES      |         | Pass state into player to allow control of player. For more info please check [flv.js doc](https://github.com/bilibili/flv.js/edit/master/docs/api.md). |
| `onPlayerDispose` | `function`     | YES      |         | Pass state into player to dispose when video is released.                                                                                               |
| `style`           | `inline-style` | NO       |         | Custom style for video player.                                                                                                                          |

## License

- This project is inspired by [video.js](https://www.videojs.com).
- This project is inspired by [flv.js](https://github.com/Bilibili/flv.js/).
- Licensed under the Apache License, Version 2.0 (the "License");
