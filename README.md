# Skywatch JS Library

A library that supports archive & live videos with Skywatch framework.

### \***\*Important information:\*\***

**This doc is only a preview version, it might be changed during the development.**

## Installation

```
npm install skywatch-library
```

or

```
yarn add skywatch-library
```

## Getting Started

- JS

```javascript
<script src="skywatch-library.min.js"></script>
<div id="root"></div>
<script>
    const options = {
      autoplay: true,
      muted: true,
      aspectRatio: '16:9',
      mobileView: false,
    };
    Skywatch.initialize('your_token');
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

- React

```javascript
import React, {useState, useEffect} from 'react';
import {ArchivesPlayer, initialize} from 'skywatch-library/react';

const APP = () => {
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    initialize('api_key');
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

## API Document - Pure JS

### initialize

This is a function which has to initiate in the beginning.

```javascript
import Skywatch from 'skywatch-library';
Skywatch.initialize('your_token');
```

### ArchivesPlayer

This is a function for showing archive video component.

```javascript
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
 Skywatch.ArchivesPlayer(
      ${video_element},
      ${device_id},
    ).then(player => {
      //do something
    });
```

| Property           | Type       | Required | Default | Description                                                                                                                                 |
| ------------------ | ---------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `video_element`    | `element`  | YES      |         | A HTML video element                                                                                                                        |
| `deviceId`         | `string`   | YES      |         | Decide on which camera is going to play.                                                                                                    |
| `Promise (player)` | `function` |          |         | A response to allow control of player. For more info please check [flv.js doc](https://github.com/bilibili/flv.js/edit/master/docs/api.md). |

## API Document - React

### initialize

This is a function which has to initiate in the beginning.

```javascript
import Skywatch from 'skywatch-library/react';

Skywatch.initialize('your_token');
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
