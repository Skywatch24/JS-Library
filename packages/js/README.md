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

Ex. Implement Skywatch library on node server, and then generate the POST API - https://localhost:3000/skywatch_service_url

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

[Use Oauth 2.0 to get access token](/packages/js/doc/oauth2.md)

[Camera API Usage](/packages/js/doc/camera.md)

[Lock API Usage](/packages/js/doc/lock.md)

## License

- This project is inspired by [video.js](https://www.videojs.com).
- This project is inspired by [flv.js](https://github.com/Bilibili/flv.js/).
- Licensed under the Apache License, Version 2.0 (the "License");
