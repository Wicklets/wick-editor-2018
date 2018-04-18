# Wick Editor v16

**Note:** The `Modifier` key in this document refers to the `Control` key in Windows, and the `Command` key on MacOS.

## Brower Support

- All features of the Wick Editor are supported in Firefox and Chrome.
- All features of the Wick Player are supported by most major browsers, including mobile browsers.

## Canvas

 - Pan canvas with `Spacebar`
 - Zoom in and out with `+` and `-` keys
 - Zoom in and out with `Modifier` + `Scroll`
 - You can also zoom in and out with the plus and minus buttons below the timeline. This is also where you can select the percent at which to zoom.
 - Reset canvas zoom level to 100% with `Modifier` + `0`
 - Canvas color can be changed in project settings
 - Canvas dimensions (width/height) can be changed in project settings

### Undo/Redo

- Undo any action by clicking `Edit` -> `Undo` or by pressing `Modifier` + `Z`
- Redo any action by clicking `Edit` -> `Redo` or by pressing `Modifier` + `Shift` + `Z`

### Copy/Cut/Paste/Delete

- Copy object(s) by pressing `Modifier`+`C` or by clicking `Edit` -> `Copy` in the menu bar
- Cut object(s) by pressing `Modifier`+`X` or by clicking `Edit` -> `Cut` in the menu bar
- Paste object(s) by pressing `Modifier`+`V` or by clicking `Edit` -> `Paste` in the menu bar
- Cut object(s) by pressing `Delete` or `Backspace`, or by clicking `Edit` -> `Delete` in the menu bar
- Duplicate object(s) by pressing `Modifier` + `D` or or right clicking and selecting `Duplicate Object(s)`.

### Ordering

**TODO**

## Toolbar

### Color Picker

**TODO**

### Selection Cursor

_Making selections_

- Click to select object
- `Shift` + click to select multiple objects
- Click and drag to select objects touching the selection box
- `Alt` + click and drag to select objects strictly inside the selection box

_Modifying selections_

- Scale by dragging handles on corners and sides
- Scale and keep aspect ratio of object(s) by holding `Shift` and dragging handles on corners
- Rotate by dragging corners
- Move object(s) by 1 pixel in any direction using the arrow keys
- Move object(s) by 10 pixels in any direction using `Shift` + arrow keys
- Select all objects on the canvas by clicking `Edit` -> `Select All` in the menu bar, or by pressing `Modifier` + `A`
- Deselect all objects on the canvas by clicking `Edit` -> `Deselect All` in the menu bar, or by using `Modifier` + `Shift` + `A`

### Path Cursor

_Making selections_

<ul>
	<li>Drag to select objects touching box</li>
	<li>Alt+drag to select objects only inside box</li>
</ul>
Modifying selections
<ul>
	<li>Drag points to move points</li>
	<li>Click stroke to add new point</li>
	<li>Double click to straighten/smooth points</li>
	<li>Command+click to remove points</li>
	<li>Drag handles to change curves</li>

Brush settings
	<ul>
		<li>Change fill color to set brush color</li>
		<li>Change brush size in inspector</li>
		<li>Change smoothness in inspector</li>
	</ul>

Pencil settings
			<ul>
				<li>Change stroke color to set pencil color</li>
				<li>Change stroke width in inspector</li>
				<li>Change smoothness in inspector</li>
			</ul>

<div class='tutorial-step-content'>
			Change colors of shapes
			Fill holes
		</div>

Rectangle settings
		<ul>
			<li>Change corner roundness in inspector</li>
		</ul>


<div class='tutorial-step-title'>Ellipse</div>
<div class='tutorial-step-content'>
	Draws circles
</div>

<div class='tutorial-step-title'>Line</div>
<div class='tutorial-step-content'>
	Draws lines
</div>

<div class='tutorial-step'>
	<div class='tutorial-step-title'>Pen</div>
	<div class='tutorial-step-content'>
		Click and drag to create points and curves
		Click first point to close shape
		Click the ends of an existing shape to add more curves to that shape
	</div>
</div>
<hr/>

<div class='tutorial-step'>
	<div class='tutorial-step-title'>Eyedropper</div>
	<div class='tutorial-step-content'>
		Picks colors
	</div>
</div>
<hr/>

<div class='tutorial-step'>
	<div class='tutorial-step-title'>Text</div>
	<div class='tutorial-step-content'>
		Click to create a text box
		Double click any text to edit it
		Text options in inspector
	</div>
</div>
<hr/>

<div class='tutorial-step'>
	<div class='tutorial-step-title'>Zoom</div>
	<div class='tutorial-step-content'>
		Click to zoom in
		Alt+click to zoom out
		Drag to zoom into a section of the screen
		Also can use + and - to zoom
		Also can command+scroll to zoom
		Also can use zoom box thing near timeline
	</div>
</div>
<hr/>

<div class='tutorial-step'>
	<div class='tutorial-step-title'>Pan</div>
	<div class='tutorial-step-content'>
		Click and drag to pan
	</div>
</div>

## Timeline

### Frames

- To add a frame, double click an empty space on the timeline or right click and select `Add Frame`
- Select frames by clicking and dragging, all frames inside the selection box will be selected.
- Delete selected frames by pressing `Delete` or right clicking and selecting `Delete Frame`
- Move frame(s) by clicking and dragging selected frames
- Change the duration of frame(s) by dragging the left or right edges of the selection box

### Playhead

- Move the playhead by dragging it, or by using the `<` and `>` keys.
- Clicking on a frame will jump the playhead to that frame.
- Play the whole timeline by clicking the `Play Preview` button, or by pressing `Enter`
- Loop the timeline by holding `Shift` and clicking the `Play Preview` button, or by pressing `Shift` + `Enter`
- Change the framerate that the timeline is played at in project settings

### Layers

- Create a layer with the `Add Layer` button
- Delete the current layer with the `Delete Layer` button
- Rename a layer by clicking on its name
- Layers can be locked by clicking the lock icon on that layer
- Layers can be hidden by clicking the eye icon in that layer
- Layers can be reordered by dragging them by the three lines icon on the left

### Tweens

- Create a motion tween on a frame by right clicking a frame and selecting `Create Motion Tween`.
- If there are multiple objects on the frame when a motion tween is created, they will be automatically grouped into a single object.
- Create keyframes by right clicking and selecting `Insert Keyframe`.
- Copy and paste keyframes by right clicking a keyframe and selecting `Copy Keyframe` or `Paste Keyframe`.
- Keyframes will be automatically added if an object is modified while the playhead is over a point on the frame without a keyframe.
- You can change the "easing" of a tween in the Inspector. The current options are `None`, `Ease In`, `Ease Out`, and `Ease In-Out`.
- If you want to rotate an object 360 degrees or more in a tween, use the `Number of Rotations` value in the Inspector. _Note: You can rotate objects counter-clockwise by using a negative value here._
- Tweening of all transformations (x, y, scale, rotation) is possible, as well as opacity.

### Sounds

**TODO**

### Onion Skinning

- Click the onion icon to enable onion skinning
- Control how many frames are shown in onion skin by dragging the edges of the box near the playhead.

## Groups

Create a group by 
Edit group by double clicking or right clicking
Leave group by using breadcrumbs or by double clicking

## Clips

Create a clip by

Clips have their own timelines

Edit timeline by double clicking or right clicking
Leave button timeline by using breadcrumbs or by double clicking

Start frame
Play once/twice/loop forever
Autoplay?

Asset dropdown

## Buttons

Create a button by
Edit button states double clicking or right clicking
Leave button timeline by using breadcrumbs or by double clicking
Asset dropdown

## Import

### Images

Import images by dragging them into the editor or by selecting `Import` -> `Image` in the menu bar.

_Supported image types:_

- `png`
- `jpeg`
- `bmp`
- `gif` (_Animated GIFs are converted into clips with all the frames of the original GIF_)

### Sounds

Import sounds by dragging them into the editor or by selecting `Import` -> `Sound` in the menu bar.

_Supported sound file types:_

- `mp3`
- `wav`
- `ogg`

### SVG

Import SVGs by dragging them into the editor or by selecting `Import` -> `SVG` in the menu bar.

### Asset Library

**TODO**

## Scripting Window

Autocomplete
Reference Section
Syntax Errors
Runtime Errors

## Writing Scripts

### Events

**TODO**

### Function Calls

**TODO**

### Variables

**TODO**

### If Statements

**TODO**

## Script Reference

### Scope

Name | Description
--- | ---
`this` | TODO
`parent` | TODO
`root` | TODO

### Events

Name | Description
--- | ---
`on(update)` | TODO
`on(load)` | TODO
`on(click)` | TODO

### Timeline

Name | Description
--- | ---
`play()` | TODO
`stop()` | TODO
`gotoAndStop(frame)` | TODO
`gotoAndPlay(frame)` | TODO
`gotoNextFrame()` | TODO
`gotoPrevFrame()` | TODO

### All Objects Attributes

Name | Description
--- | ---
`x` | TODO
`y` | TODO
`scaleX` | TODO
`scaleY` | TODO
`rotation` | TODO
`flipX` | TODO
`flipY` | TODO
`opacity` | TODO

### Clip Attributes

Name | Description
--- | ---
`currentPlayheadPosition` | TODO
`currentFrameName` | TODO
`clones` | TODO

### Object Methods

Name | Description
--- | ---
`clone()` | TODO
`delete()` | TODO
`hitTest(object)` | TODO

### Mouse Input

Name | Description
--- | ---
`mouseX` | TODO
`mouseY` | TODO
`mouseMoveX` | TODO
`mouseMoveY` | TODO

### Keyboard Input

Name | Description
--- | ---
`keyIsDown(key)` | TODO
`keyJustPressed(key)` | TODO

### Keyboard Keys

Name | Description
--- | ---
`KEY_A` | TODO

### Sound

Name | Description
--- | ---
`playSound(filename)` | TODO
`stopAllSounds()` | TODO
`mute()` | TODO
`unmute()` | TODO

## Saving Projects

### Autosave

- Projects are "autosaved" every time you run your project.
- You can also force an autosave by clicking on the title of the project in the top-left corner of the screen, or by pressing `Modifier` + `Shift` + `S`.
- __Autosaved projects are deleted when you clear your browser cache.__ It is recommended to save your projects as .wick files as often as possible.

### .wick file format

- A .wick file is the native filetype for Wick projects.
- .wick files can be opened in the editor by dragging them into the browser window, or by clicking `File` -> `Open Project` and selecting them.

##Exporting Projects

### .zip archive

- `File` -> `Export ZIP Archive`
- The exported .zip archive will contain the Wick Player bundled into an html file named `index.html`, as well as your project named `wick-project.wick`.
- Most Flash/HTML5 game websites accept `.zip` files in this format.

### .html file

- `File` -> `Export HTML File`
- HTML files can be opened by all web browsers and can play the Wick project inside.
- HTML files can easily be embedded inside another webpage (see `Embedding Projects`)

### Animated GIF

- `File` -> `Export Animated GIF`
- Scripts do not work in animated GIFs, only the animation will play.

### Video

- `File` -> `Export Video`
- Choose quality (Low, Medium, High, or Ultra)
- Videos are exported as `mp4` files using the `mpeg4` codec.

## Builtin Player

- Play your project in the builtin player by clicking the `Run` button in the menu bar or by pressing `Modifier` + `Enter`.
- Close the builtin player by clicking the X in the top right corner or by pressing `Escape`.
- If script errors happen inside the builtin player, the player will close and the editor will show you where the error happened by selecting the object or frame that caused the error.
- You can run the builtin player in a new window by pressing `Modifier` + `Shift` + `Enter`, but errors will not be shown in the editor.

## Embedding Projects

### Embedding an HTML file

You can embed a Wick project exported as an HTML file by using an iframe.

_Example:_

`<iframe src="myproject.html" width="720" height="480"></iframe>`

### Embedding a .wick file

To embed a .wick file, you will need the Wick Player html file. Download it **TODO** here.

Then embed the player in an iframe and add the filename of your project with an `#` after `player.html` as shown here:

`<iframe width="720" height="480" src="player.html#myproject.wick"></iframe>`