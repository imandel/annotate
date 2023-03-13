# Annotation Tool for multi-model data

⚡ Annotate your multi-model data in a simple web app ⚡

Built with 

- Svelte
- TypeScript & JavaScript
- Electron
- Deployed on Surge

Try it [here](https://annotate.surge.sh/).

## Overview

<img src="images/img.png" alt="screenshot" style="zoom:30%;" />

The task of annotating multi-modal data streams, such as videos, images, GPS data, and audios, is a challenging undertaking for researchers. To address this issue, we aim to develop a robust web tool that enables non-technical users to annotate these data streams seamlessly. Our tool is designed to allow users to label videos in a timeline, add customized tags, comments, and download/upload annotation files for further analysis. The tool will provide an all-in-one platform for investigating and labeling sensor data, video, transcripts, and annotations.

We recognize that existing tools for analyzing multi-modal data are often limited, particularly for non-technical users. Our aim is to create a user-friendly interface that can be used by a range of groups to label data streams. We are particularly focused on time-synchronized data streams, as this is an area where current tools fall short. Our project objective is to build a functional tool that incorporates data visualization, streaming data synchronization, multi-modal data synchronization, and an aesthetically pleasing and clear layout of visualizations. We will be using Svelte and Electron to build a cross-platform application.

This project is instructed and innitialized by [Ilan Mandel](https://github.com/imandel) (Phd student at Cornell Tech), and was a special research project for Cornell Tech master students ([Chenran Ning](https://github.com/jw782cn) (cn257), Ka Wing Lui (kl647), Jeongmin Huh (jh2229)) from Feb 2021 to Dec 2021. Currently, this project is being developed by Chenran Ning and Ilan Mandel.

## Get started

### localhost

```bash
npm run dev
```


### With [surge](https://surge.sh/)

Install `surge` if you haven't already:

```bash
npm install -g surge
```

Then, from within your project folder:

```bash
npm run build
surge public my-project.surge.sh
```





## TODO

- [ ] timeline bar is too tall. Seems to act strange when clicking
- [x] bug in timeline when dragging cursor  
- [x] UI for zooming timeline is broken
- [x] load in video files
- [x] select audio
- [x] hide videos
- [ ] keyboard shortcuts
- [ ] selection box spacing is ugly
- [ ] remove `$paused`
- [x] for now always use transcript from video with lower offset
- [ ] fix this nonsense `$: if (files && Object.keys($videoFiles).length === 0) {}`
- [ ] - [ ] Change the main video file in interface
- [ ] change the way we hide videos
- [ ] labels not showing up on transcript
- [ ] scroll right with mouse rather than trackpad
- [ ] zoom is broken
- [ ] labels should be persistent
- [ ] notes should be persistent
- [x] rewind 10 seconds button
- [ ] freezing a lot (on windows not on mac)
- [x] play at multiple speeds
- [ ] main timeline line disappears
- [x] `index.81045a19.js:49 Uncaught (in promise) TypeError: window.showSaveFilePicker is not a function`
- [x] redirect `http` to `https`
