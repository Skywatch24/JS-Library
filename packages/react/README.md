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
  controls={}
  onTimeUpdate={}
  onEnded={}
  onReady={}
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
| `controls`        | `bool`         | NO       | `true`                                                       | Show video controls                                               |
| `onTimeUpdate`    | `func`         | NO       |                                                              | Callback fired when the current playback position has changed     |   
| `onEnded`         | `func`         | NO       |                                                              | Callback fired when the end of the media resource is reached      | 
| `onReady`         | `func`         | NO       |                                                              | Callback fired when the video is ready to play                    | 

### FlvPlayer

This is a component for playing live streaming.

```javascript
<FlvPlayer 
  deviceId={} 
  onPlayerInit={} 
  onPlayerDispose={} 
  style={} 
  controls={}
  onReady={}
/>
```

| Property          | Type           | Required | Default | Description                                                                                                                                             |
| ----------------- | -------------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `deviceId`        | `string`       | YES      |         | Decide on which camera is going to play.                                                                                                                |
| `onPlayerInit`    | `function`     | YES      |         | Pass state into player to allow control of player. For more info please check [flv.js doc](https://github.com/bilibili/flv.js/edit/master/docs/api.md). |
| `onPlayerDispose` | `function`     | YES      |         | Pass state into player to dispose when video is released.                                                                                               |
| `style`           | `inline-style` | NO       |         | Custom style for video player.                                                                                                                          |
| `controls`        | `bool`         | NO       | `true`  | Show video controls                                                                         |
| `onReady`         | `func`         | NO       |         | Callback fired when the video is ready to play                                              | 

### CameraView

This is a component for playing live streaming and archive video.

```javascript
<CameraView 
  deviceId={}
  renderLoading={}
/>
```

You need to import the CSS file to your JavaScript file

```javascript
import '@skywatch/react/lib/style/camera-view.css';
```

#### Custom Style

If you want to overwrite the default style, you can use the browser dev tool to find out the id/class of the element, and create your own CSS file to overwrite it.

```css
/* overwrite.css */
#controlbar_container {
  background-color:burlywood
}
.meta_timeline_i {
  background-color: coral !important;
}
```

Then, import the `overwrite.css` file

```javascript
import '@skywatch/react/lib/style/camera-view.css';
import 'overwrite.css'
```

#### Custom Controls

Methods to control the video are exposed by `useImperativeHandle` hook. 
To access these methods, you need to create your `ref` and pass it to `CameraView` component. Also, you have to disable the default controls.
Then you can use the exposed methods by the `ref`. For example,

```javascript
const APP = () => {
  const cameraViewRef = useRef();
  return (
    <>
      <CameraView
        deviceId={'0000'}
        controls={false}
        ref={cameraViewRef}
      />
      <button onClick={() => cameraViewRef.current.play()}>play</button>
      <button onClick={() => cameraViewRef.current.pause()}>pause</button>  
    </>
  );
};
```

| Method             | Parameters       | Returns  | Description                                |
| ------------------ | ---------------- | -------- | ------------------------------------------ |
| `play()`           | none             | none     | Play the video.                            |
| `pause()`          | none             | none     | Pause the current video.                   |
| `fastForward()`    | none             | none     | Start fast forward mode.                   |
| `toggleMute()`     | none             | none     | Mute or unmute the video.                  |
| `goLive()`         | none             | none     | Start playing live video.                  |
| `seek(string)`     | `Neumber|String` | none     | Play video at the provided unix timestamp. |
| `getAllArchives()` | none             | `array`  | Get data of all archives.                  | 
| `isLive()`         | none             | `bool`   | Check if the video is in live mode.        |

#### Props

| Property          | Type           | Required | Default | Description                                                                                                                                             |
| ----------------- | -------------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `deviceId`        | `string`       | YES      |         | Decide on which camera is going to play.                                             |
| `renderLoading`   | `function`     | NO       | `() => <div style={loadingStyle}></div>` | Function returns the loading element.                   |
| `controls`        | `bool`         | NO       | `true`  | If `false`, the default controls will not be used.                                   |    

## License

- This project is inspired by [video.js](https://www.videojs.com).
- This project is inspired by [flv.js](https://github.com/Bilibili/flv.js/).
- Licensed under the Apache License, Version 2.0 (the "License");
