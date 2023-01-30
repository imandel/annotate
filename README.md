TODO

- [x] bug in timeline when dragging cursor  
- [x] UI for zooming timeline is broken
- [x] load in video files
- [x] select audio
- [x] hide videos
- [ ] keyboard shortcuts
- [ ] selection box spacing is ugly
- [ ] remove `$paused`
- [x] for now always use transcript from video with lower offset
- [ ]  fix this nonsense `$: if (files && Object.keys($videoFiles).length === 0) {}`
- [ ]  - [ ]  Change the main video file in interface
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

## Get started


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
