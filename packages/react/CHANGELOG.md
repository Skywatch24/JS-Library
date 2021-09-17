# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.2.1](https://github.com/Skywatch24/JS-Library/compare/@skywatch/react@1.2.0...@skywatch/react@1.2.1) (2021-09-17)


### Bug Fixes

* **react:** move style directory to src/style ([2f2b6d8](https://github.com/Skywatch24/JS-Library/commit/2f2b6d8b7642c2f6f1f06f544e94e21f3acfbbf5))





# [1.2.0](https://github.com/Skywatch24/JS-Library/compare/@skywatch/react@1.1.3...@skywatch/react@1.2.0) (2021-09-17)


### Bug Fixes

* handle change browser tab ([7f5baee](https://github.com/Skywatch24/JS-Library/commit/7f5baeedbf93bc6099fd728a3015c5809d680951))
* handle click smart_ff button when playing live ([04cd583](https://github.com/Skywatch24/JS-Library/commit/04cd583e7d4b39ac791cb956647520f7c268aec6))
* handle dropdown onClick event and fix css style ([f1f5423](https://github.com/Skywatch24/JS-Library/commit/f1f5423a9ba6dc3bf4e2c52812858d43e81a1f92))
* move setDelay(1000) out from _fetchAllInterval.progress ([c2fbaa8](https://github.com/Skywatch24/JS-Library/commit/c2fbaa83a1daefcd0dd80a5f4a265b2c90f22337))
* reset timebar_container position to show meta properly ([8133c16](https://github.com/Skywatch24/JS-Library/commit/8133c166497a4ae6f8cfe7004fc812afb8612021))
* restrict draggble area to prevent crash ([762e88c](https://github.com/Skywatch24/JS-Library/commit/762e88c5f1df3e5ab9815400a0d5246a30c84336))
* resume updateCurrentTime when controls is false ([9bbba29](https://github.com/Skywatch24/JS-Library/commit/9bbba29ec6fd0f21c2ca00bd6b234b29d858f3a0))


### Features

* add flvCounter, handle pause then goLive ([47c32f7](https://github.com/Skywatch24/JS-Library/commit/47c32f73adad5775988c532928c26687457f9103))
* create CameraViewWebComponent to enable pure js usage ([9036bf9](https://github.com/Skywatch24/JS-Library/commit/9036bf9845e5780b9069ef75e02f0f9a8e65db01))
* expose isLive function to check if the video is in live mode ([486b1e7](https://github.com/Skywatch24/JS-Library/commit/486b1e7f5d3ebc848bc059172b2b41ab4e08c013))
* handle fast forward then pause/play ([df9ac86](https://github.com/Skywatch24/JS-Library/commit/df9ac86db8f0469a59b0b4c47a6cdc0a4bbe4a27))
* **react:** add less loader in webpack, remove unused webpack config ([863983f](https://github.com/Skywatch24/JS-Library/commit/863983f9e2a62a125e179b07bf036749a3eac033))
* **react:** expose video control functions in CameraView ([2c75518](https://github.com/Skywatch24/JS-Library/commit/2c75518d0c8fb547dc2b9a8dd2afecfb532c3178))
* **react:** extract CSS, build CameraView properly ([12ce8ed](https://github.com/Skywatch24/JS-Library/commit/12ce8ed93a7ad1851bb16bda0c146d82fe305f40))
* **react:** handle onVisibilityChange event ([2cf6730](https://github.com/Skywatch24/JS-Library/commit/2cf6730d47ef7f01a86ce79ba64ece5c8a85520a))
* **react:** move renderLoading to props to enable customization ([a3cf1b3](https://github.com/Skywatch24/JS-Library/commit/a3cf1b3bda7a36826c0a2b4c06b71a80d8a5b17b))
* add _onChangeTimeAndScale function to handle disable to_next or to_previous button ([481d496](https://github.com/Skywatch24/JS-Library/commit/481d496040ea59f762b08d13f0e0f824f6788632))
* add loading spinner when seeking ([7e86972](https://github.com/Skywatch24/JS-Library/commit/7e86972c2bb6d6ac48eef03b49545db97548d658))
* build a react component that can play CR and live ([6619ebd](https://github.com/Skywatch24/JS-Library/commit/6619ebd9f309f7928892771a190f9e83930ffab0))
* get next archive automatically after video ended ([459d9f2](https://github.com/Skywatch24/JS-Library/commit/459d9f2dbd7dc51980329be8d8dc301e7c981419))
* handle change volume ([41ca3d7](https://github.com/Skywatch24/JS-Library/commit/41ca3d745c7d7ca6c80f3bee50a18aea3f0960f8))
* handle click to gap with no archive ([2d39588](https://github.com/Skywatch24/JS-Library/commit/2d395880b30210e0d00fd9f61c0ac7054abb4c6e))
* handle drag timebar cursor ([8c25fb6](https://github.com/Skywatch24/JS-Library/commit/8c25fb6c7cac3d3720e8ae14c4c2cee700e5dea6))
* handle onPlayerHole ([b45eeec](https://github.com/Skywatch24/JS-Library/commit/b45eeec606e05b69891f561e7bb1f9c7a6ad6582))
* handle renderScaleIndicator and change scale ([3f8986b](https://github.com/Skywatch24/JS-Library/commit/3f8986b2ca86c992eae6e54cece1ea8f5d69c1b0))
* handle timebar cursor position ([33388f5](https://github.com/Skywatch24/JS-Library/commit/33388f553015e949cefdeb90edc6c9dae29254b5))
* handle timebar onPreviousClick and onNextClick ([32596da](https://github.com/Skywatch24/JS-Library/commit/32596da43b89cb96c0b1b677e85e2984672d7d5d))
* modify the structure of api and server packages so that user can use skywatch API directly ([76168ef](https://github.com/Skywatch24/JS-Library/commit/76168ef068b3a96d628a0b47cf2396c04709722a))
* seek and play smart_ff ([939222b](https://github.com/Skywatch24/JS-Library/commit/939222b4d91d586d055c4594b4f76e8a7e3522ba))
* show timebar meta ([0c60c7c](https://github.com/Skywatch24/JS-Library/commit/0c60c7c3ff72aed792471b81b752bbe5f539fcc9))
* sync cursor with video time in smart_ff mode ([4e10410](https://github.com/Skywatch24/JS-Library/commit/4e10410a831c3baebefd00f83b6666174e1f6a5d))
* **CameraView:** fetch camera info and create init function ([17f24e5](https://github.com/Skywatch24/JS-Library/commit/17f24e588f3668a2f6bdd69696d869abf1934bb0))





# [1.1.0](https://github.com/Skywatch24/JS-Library/compare/@skywatch/react@1.0.5...@skywatch/react@1.1.0) (2021-05-25)


### Features

* edit init function ([12b48fd](https://github.com/Skywatch24/JS-Library/commit/12b48fd35c0e1827c56b55e625fc9a68a984c1b6))
* use backend JS Library ([97fdd6e](https://github.com/Skywatch24/JS-Library/commit/97fdd6e5531bb4cb0c6d4d56e92a6125313b8802))
