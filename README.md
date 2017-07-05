---
title: Camera
description: Take pictures with the device camera.
---
<!---
# license: Licensed to the Apache Software Foundation (ASF) under one
#         or more contributor license agreements.  See the NOTICE file
#         distributed with this work for additional information
#         regarding copyright ownership.  The ASF licenses this file
#         to you under the Apache License, Version 2.0 (the
#         "License"); you may not use this file except in compliance
#         with the License.  You may obtain a copy of the License at
#
#           http://www.apache.org/licenses/LICENSE-2.0
#
#         Unless required by applicable law or agreed to in writing,
#         software distributed under the License is distributed on an
#         "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
#         KIND, either express or implied.  See the License for the
#         specific language governing permissions and limitations
#         under the License.
#
#  Modifications for Tabris.js by EclipseSource Inc.
-->

# tabris-plugin-camera

This is a fork of [cordova-plugin-camera](https://github.com/apache/cordova-plugin-camera/commit/3b8f64e330df7f1b9d5088fd1a3f7f3e6193c83c), with adjustments made for compatibility with the [Tabris.js](http://tabrisjs.com/) framework.

This plugin defines a global `navigator.camera` object, which provides an API for taking pictures and for choosing images from
the system's image library.

## Installation

You can add this to your Tabris.js project by includin the followin line in your `config.xml`:

```xml
<plugin name="tabris-plugin-camera" spec="https://github.com/eclipsesource/tabris-plugin-camera.git" />
```

## How to Contribute

Contributors are welcome! And we need your contributions to keep the project moving forward. You can [report bugs](https://github.com/eclipsesource/tabris-plugin-camera/issues/new) or [contribute code](https://github.com/eclipsesource/tabris-plugin-camera/pulls).

In order for your changes to be accepted, you need to add yourself as a contributer in the license heady of every modified file.

**And don't forget to test and document your code.**


### iOS Quirks

Since iOS 10 it's mandatory to add a `NSCameraUsageDescription` and `NSPhotoLibraryUsageDescription` in the info.plist.

- `NSCameraUsageDescription` describes the reason that the app accesses the user’s camera.
- `NSPhotoLibraryUsageDescription` describes the reason the app accesses the user's photo library. 

When the system prompts the user to allow access, this string is displayed as part of the dialog box. 

To add this entry you can pass the following variables on plugin install.

- `CAMERA_USAGE_DESCRIPTION` for `NSCameraUsageDescription`
- `PHOTOLIBRARY_USAGE_DESCRIPTION` for `NSPhotoLibraryUsageDescription`

Example:

    cordova plugin add cordova-plugin-camera --variable CAMERA_USAGE_DESCRIPTION="your usage message" --variable PHOTOLIBRARY_USAGE_DESCRIPTION="your usage message"

If you don't pass the variable, the plugin will add an empty string as value.

---

# API Reference <a name="reference"></a>


* [camera](#module_camera)
    * [.getPicture(successCallback, errorCallback, options)](#module_camera.getPicture)
    * [.cleanup()](#module_camera.cleanup)
    * [.onError](#module_camera.onError) : <code>function</code>
    * [.onSuccess](#module_camera.onSuccess) : <code>function</code>
    * [.CameraOptions](#module_camera.CameraOptions) : <code>Object</code>


* [Camera](#module_Camera)
    * [.DestinationType](#module_Camera.DestinationType) : <code>enum</code>
    * [.EncodingType](#module_Camera.EncodingType) : <code>enum</code>
    * [.MediaType](#module_Camera.MediaType) : <code>enum</code>
    * [.PictureSourceType](#module_Camera.PictureSourceType) : <code>enum</code>
    * [.PopoverArrowDirection](#module_Camera.PopoverArrowDirection) : <code>enum</code>
    * [.Direction](#module_Camera.Direction) : <code>enum</code>

* [CameraPopoverHandle](#module_CameraPopoverHandle)
* [CameraPopoverOptions](#module_CameraPopoverOptions)

---

<a name="module_camera"></a>

## camera
<a name="module_camera.getPicture"></a>

### camera.getPicture(successCallback, errorCallback, options)
Takes a photo using the camera, or retrieves a photo from the device's
image gallery.  The image is passed to the success callback as a
Base64-encoded `String`, or as the URI for the image file.

The `camera.getPicture` function opens the device's default camera
application that allows users to snap pictures by default - this behavior occurs,
when `Camera.sourceType` equals [`Camera.PictureSourceType.CAMERA`](#module_Camera.PictureSourceType).
Once the user snaps the photo, the camera application closes and the application is restored.

If `Camera.sourceType` is `Camera.PictureSourceType.PHOTOLIBRARY` or
`Camera.PictureSourceType.SAVEDPHOTOALBUM`, then a dialog displays
that allows users to select an existing image.

The return value is sent to the [`cameraSuccess`](#module_camera.onSuccess) callback function, in
one of the following formats, depending on the specified
`cameraOptions`:

- A `String` containing the Base64-encoded photo image.
- A `String` representing the image file location on local storage (default).

You can do whatever you want with the encoded image or URI, for
example:

- Render the image in an `<img>` tag, as in the example below
- Save the data locally (`LocalStorage`, [Lawnchair](http://brianleroux.github.com/lawnchair/), etc.)
- Post the data to a remote server

__NOTE__: Photo resolution on newer devices is quite good. Photos
selected from the device's gallery are not downscaled to a lower
quality, even if a `quality` parameter is specified.  To avoid common
memory problems, set `Camera.destinationType` to `FILE_URI` rather
than `DATA_URL`.

__Supported Platforms__

- Android
- iOS
- Windows

More examples [here](#camera-getPicture-examples). Quirks [here](#camera-getPicture-quirks).

**Kind**: static method of <code>[camera](#module_camera)</code>  

| Param | Type | Description |
| --- | --- | --- |
| successCallback | <code>[onSuccess](#module_camera.onSuccess)</code> |  |
| errorCallback | <code>[onError](#module_camera.onError)</code> |  |
| options | <code>[CameraOptions](#module_camera.CameraOptions)</code> | CameraOptions |

**Example**  
```js
navigator.camera.getPicture(cameraSuccess, cameraError, cameraOptions);
```
<a name="module_camera.cleanup"></a>

### camera.cleanup()
Removes intermediate image files that are kept in temporary storage
after calling [`camera.getPicture`](#module_camera.getPicture). Applies only when the value of
`Camera.sourceType` equals `Camera.PictureSourceType.CAMERA` and the
`Camera.destinationType` equals `Camera.DestinationType.FILE_URI`.

__Supported Platforms__

- iOS

**Kind**: static method of <code>[camera](#module_camera)</code>  
**Example**  
```js
navigator.camera.cleanup(onSuccess, onFail);

function onSuccess() {
    console.log("Camera cleanup success.")
}

function onFail(message) {
    alert('Failed because: ' + message);
}
```
<a name="module_camera.onError"></a>

### camera.onError : <code>function</code>
Callback function that provides an error message.

**Kind**: static typedef of <code>[camera](#module_camera)</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | The message is provided by the device's native code. |

<a name="module_camera.onSuccess"></a>

### camera.onSuccess : <code>function</code>
Callback function that provides the image data.

**Kind**: static typedef of <code>[camera](#module_camera)</code>  

| Param | Type | Description |
| --- | --- | --- |
| imageData | <code>string</code> | Base64 encoding of the image data, _or_ the image file URI, depending on [`cameraOptions`](#module_camera.CameraOptions) in effect. |

**Example**  
```js
// Show image
//
function cameraCallback(imageData) {
   var image = document.getElementById('myImage');
   image.src = "data:image/jpeg;base64," + imageData;
}
```
<a name="module_camera.CameraOptions"></a>

### camera.CameraOptions : <code>Object</code>
Optional parameters to customize the camera settings.
* [Quirks](#CameraOptions-quirks)

**Kind**: static typedef of <code>[camera](#module_camera)</code>  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| quality | <code>number</code> | <code>50</code> | Quality of the saved image, expressed as a range of 0-100, where 100 is typically full resolution with no loss from file compression. (Note that information about the camera's resolution is unavailable.) |
| destinationType | <code>[DestinationType](#module_Camera.DestinationType)</code> | <code>FILE_URI</code> | Choose the format of the return value. |
| sourceType | <code>[PictureSourceType](#module_Camera.PictureSourceType)</code> | <code>CAMERA</code> | Set the source of the picture. |
| allowEdit | <code>Boolean</code> | <code>true</code> | Allow simple editing of image before selection. |
| encodingType | <code>[EncodingType](#module_Camera.EncodingType)</code> | <code>JPEG</code> | Choose the  returned image file's encoding. |
| targetWidth | <code>number</code> |  | Width in pixels to scale image. Must be used with `targetHeight`. Aspect ratio remains constant. |
| targetHeight | <code>number</code> |  | Height in pixels to scale image. Must be used with `targetWidth`. Aspect ratio remains constant. |
| mediaType | <code>[MediaType](#module_Camera.MediaType)</code> | <code>PICTURE</code> | Set the type of media to select from.  Only works when `PictureSourceType` is `PHOTOLIBRARY` or `SAVEDPHOTOALBUM`. |
| correctOrientation | <code>Boolean</code> |  | Rotate the image to correct for the orientation of the device during capture. |
| saveToPhotoAlbum | <code>Boolean</code> |  | Save the image to the photo album on the device after capture. |
| popoverOptions | <code>[CameraPopoverOptions](#module_CameraPopoverOptions)</code> |  | iOS-only options that specify popover location in iPad. |
| cameraDirection | <code>[Direction](#module_Camera.Direction)</code> | <code>BACK</code> | Choose the camera to use (front- or back-facing). |

---

<a name="module_Camera"></a>

## Camera
<a name="module_Camera.DestinationType"></a>

### Camera.DestinationType : <code>enum</code>
Defines the output format of `Camera.getPicture` call.
_Note:_ On iOS passing `DestinationType.NATIVE_URI` along with
`PictureSourceType.PHOTOLIBRARY` or `PictureSourceType.SAVEDPHOTOALBUM` will
disable any image modifications (resize, quality change, cropping, etc.) due
to implementation specific.

**Kind**: static enum property of <code>[Camera](#module_Camera)</code>  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| DATA_URL | <code>number</code> | <code>0</code> | Return base64 encoded string. DATA_URL can be very memory intensive and cause app crashes or out of memory errors. Use FILE_URI or NATIVE_URI if possible |
| FILE_URI | <code>number</code> | <code>1</code> | Return file uri (content://media/external/images/media/2 for Android) |
| NATIVE_URI | <code>number</code> | <code>2</code> | Return native uri (eg. asset-library://... for iOS) |

<a name="module_Camera.EncodingType"></a>

### Camera.EncodingType : <code>enum</code>
**Kind**: static enum property of <code>[Camera](#module_Camera)</code>  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| JPEG | <code>number</code> | <code>0</code> | Return JPEG encoded image |
| PNG | <code>number</code> | <code>1</code> | Return PNG encoded image |

<a name="module_Camera.MediaType"></a>

### Camera.MediaType : <code>enum</code>
**Kind**: static enum property of <code>[Camera](#module_Camera)</code>  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| PICTURE | <code>number</code> | <code>0</code> | Allow selection of still pictures only. DEFAULT. Will return format specified via DestinationType |
| VIDEO | <code>number</code> | <code>1</code> | Allow selection of video only, ONLY RETURNS URL |
| ALLMEDIA | <code>number</code> | <code>2</code> | Allow selection from all media types |

<a name="module_Camera.PictureSourceType"></a>

### Camera.PictureSourceType : <code>enum</code>
Defines the output format of `Camera.getPicture` call.
_Note:_ On iOS passing `PictureSourceType.PHOTOLIBRARY` or `PictureSourceType.SAVEDPHOTOALBUM`
along with `DestinationType.NATIVE_URI` will disable any image modifications (resize, quality
change, cropping, etc.) due to implementation specific.

**Kind**: static enum property of <code>[Camera](#module_Camera)</code>  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| PHOTOLIBRARY | <code>number</code> | <code>0</code> | Choose image from the device's photo library (same as SAVEDPHOTOALBUM for Android) |
| CAMERA | <code>number</code> | <code>1</code> | Take picture from camera |
| SAVEDPHOTOALBUM | <code>number</code> | <code>2</code> | Choose image only from the device's Camera Roll album (same as PHOTOLIBRARY for Android) |

<a name="module_Camera.PopoverArrowDirection"></a>

### Camera.PopoverArrowDirection : <code>enum</code>
Matches iOS UIPopoverArrowDirection constants to specify arrow location on popover.

**Kind**: static enum property of <code>[Camera](#module_Camera)</code>  
**Properties**

| Name | Type | Default |
| --- | --- | --- |
| ARROW_UP | <code>number</code> | <code>1</code> | 
| ARROW_DOWN | <code>number</code> | <code>2</code> | 
| ARROW_LEFT | <code>number</code> | <code>4</code> | 
| ARROW_RIGHT | <code>number</code> | <code>8</code> | 
| ARROW_ANY | <code>number</code> | <code>15</code> | 

<a name="module_Camera.Direction"></a>

### Camera.Direction : <code>enum</code>
**Kind**: static enum property of <code>[Camera](#module_Camera)</code>  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| BACK | <code>number</code> | <code>0</code> | Use the back-facing camera |
| FRONT | <code>number</code> | <code>1</code> | Use the front-facing camera |

---

<a name="module_CameraPopoverOptions"></a>

## CameraPopoverOptions
iOS-only parameters that specify the anchor element location and arrow
direction of the popover when selecting images from an iPad's library
or album.
Note that the size of the popover may change to adjust to the
direction of the arrow and orientation of the screen.  Make sure to
account for orientation changes when specifying the anchor element
location.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [x] | <code>Number</code> | <code>0</code> | x pixel coordinate of screen element onto which to anchor the popover. |
| [y] | <code>Number</code> | <code>32</code> | y pixel coordinate of screen element onto which to anchor the popover. |
| [width] | <code>Number</code> | <code>320</code> | width, in pixels, of the screen element onto which to anchor the popover. |
| [height] | <code>Number</code> | <code>480</code> | height, in pixels, of the screen element onto which to anchor the popover. |
| [arrowDir] | <code>[PopoverArrowDirection](#module_Camera.PopoverArrowDirection)</code> | <code>ARROW_ANY</code> | Direction the arrow on the popover should point. |

---

<a name="module_CameraPopoverHandle"></a>

## CameraPopoverHandle
A handle to an image picker popover.

__Supported Platforms__

- iOS

**Example**  
```js
navigator.camera.getPicture(onSuccess, onFail,
{
    destinationType: Camera.DestinationType.FILE_URI,
    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
    popoverOptions: new CameraPopoverOptions(300, 300, 100, 100, Camera.PopoverArrowDirection.ARROW_ANY)
});

// Reposition the popover if the orientation changes.
window.onorientationchange = function() {
    var cameraPopoverHandle = new CameraPopoverHandle();
    var cameraPopoverOptions = new CameraPopoverOptions(0, 0, 100, 100, Camera.PopoverArrowDirection.ARROW_ANY);
    cameraPopoverHandle.setPosition(cameraPopoverOptions);
}
```
---


## `camera.getPicture` Errata

#### Example <a name="camera-getPicture-examples"></a>

Take a photo and retrieve the image's file location:

    navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
        destinationType: Camera.DestinationType.FILE_URI });

    function onSuccess(imageURI) {
        var image = document.getElementById('myImage');
        image.src = imageURI;
    }

    function onFail(message) {
        console.log('Failed because: ' + message);
    }

Take a photo and retrieve it as a Base64-encoded image:

    /**
     * Warning: Using DATA_URL is not recommended! The DATA_URL destination
     * type is very memory intensive, even with a low quality setting. Using it
     * can result in out of memory errors and application crashes. Use FILE_URI
     * or NATIVE_URI instead.
     */
    navigator.camera.getPicture(onSuccess, onFail, { quality: 25,
        destinationType: Camera.DestinationType.DATA_URL
    });

    function onSuccess(imageData) {
        var image = document.getElementById('myImage');
        image.src = "data:image/jpeg;base64," + imageData;
    }

    function onFail(message) {
        console.log('Failed because: ' + message);
    }

#### Preferences (iOS)

-  __CameraUsesGeolocation__ (boolean, defaults to false). For capturing JPEGs, set to true to get geolocation data in the EXIF header. This will trigger a request for geolocation permissions if set to true.

        <preference name="CameraUsesGeolocation" value="false" />

#### Android Quirks

Android uses intents to launch the camera activity on the device to capture
images, and on phones with low memory, the Cordova activity may be killed.  In this
scenario, the result from the plugin call will be delivered via the resume event.
See [the Android Lifecycle guide][android_lifecycle]
for more information. The `pendingResult.result` value will contain the value that
would be passed to the callbacks (either the URI/URL or an error message). Check
the `pendingResult.pluginStatus` to determine whether or not the call was
successful.


## `CameraOptions` Errata <a name="CameraOptions-quirks"></a>

#### Android Quirks

- Any `cameraDirection` value results in a back-facing photo.

- **`allowEdit` is unpredictable on Android and it should not be used!** The Android implementation of this plugin tries to find and use an application on the user's device to do image cropping. The plugin has no control over what application the user selects to perform the image cropping and it is very possible that the user could choose an incompatible option and cause the plugin to fail. This sometimes works because most devices come with an application that handles cropping in a way that is compatible with this plugin (Google Plus Photos), but it is unwise to rely on that being the case. If image editing is essential to your application, consider seeking a third party library or plugin that provides its own image editing utility for a more robust solution.

- `Camera.PictureSourceType.PHOTOLIBRARY` and `Camera.PictureSourceType.SAVEDPHOTOALBUM` both display the same photo album.

- Ignores the `encodingType` parameter if the image is unedited (i.e. `quality` is 100, `correctOrientation` is false, and no `targetHeight` or `targetWidth` are specified). The `CAMERA` source will always return the JPEG file given by the native camera and the `PHOTOLIBRARY` and `SAVEDPHOTOALBUM` sources will return the selected file in its existing encoding.

#### iOS Quirks

- When using `destinationType.FILE_URI`, photos are saved in the application's temporary directory. The contents of the application's temporary directory is deleted when the application ends.

- When using `destinationType.NATIVE_URI` and `sourceType.CAMERA`, photos are saved in the saved photo album regardless on the value of `saveToPhotoAlbum` parameter.

- When using `destinationType.NATIVE_URI` and `sourceType.PHOTOLIBRARY` or `sourceType.SAVEDPHOTOALBUM`, all editing options are ignored and link is returned to original picture.

## Sample: Take Pictures, Select Pictures from the Picture Library, and Get Thumbnails <a name="sample"></a>

The Camera plugin allows you to do things like open the device's Camera app and take a picture, or open the file picker and select one. The code snippets in this section demonstrate different tasks including:

* Open the Camera app and [take a Picture](#takePicture)
* Take a picture and [return thumbnails](#getThumbnails) (resized picture)
* Take a picture and [generate a FileEntry object](#convert)
* [Select a file](#selectFile) from the picture library
* Select a JPEG image and [return thumbnails](#getFileThumbnails) (resized image)
* Select an image and [generate a FileEntry object](#convert)

## Take a Picture <a name="takePicture"></a>

Before you can take a picture, you need to set some Camera plugin options to pass into the Camera plugin's `getPicture` function. Here is a common set of recommendations. In this example, you create the object that you will use for the Camera options, and set the `sourceType` dynamically to support both the Camera app and the file picker.

```js
function setOptions(srcType) {
    var options = {
        // Some common settings are 20, 50, and 100
        quality: 50,
        destinationType: Camera.DestinationType.FILE_URI,
        // In this app, dynamically set the picture source, Camera or photo gallery
        sourceType: srcType,
        encodingType: Camera.EncodingType.JPEG,
        mediaType: Camera.MediaType.PICTURE,
        allowEdit: true,
        correctOrientation: true  //Corrects Android orientation quirks
    }
    return options;
}
```

You take a picture by passing in the options object to `getPicture`, which takes a CameraOptions object as the third argument. When you call `setOptions`, pass `Camera.PictureSourceType.CAMERA` as the picture source.

```js
function openCamera(selection) {

    var srcType = Camera.PictureSourceType.CAMERA;
    var options = setOptions(srcType);
    var func = createNewFileEntry;

    navigator.camera.getPicture(function cameraSuccess(imageUri) {

        displayImage(imageUri);
        // You may choose to copy the picture, save it somewhere, or upload.
        func(imageUri);

    }, function cameraError(error) {
        console.debug("Unable to obtain picture: " + error, "app");

    }, options);
}
```

Once you take the picture, you can display it or do something else. In this example, call the app's `displayImage` function from the preceding code.

```js
function displayImage(imgUri) {

    var elem = document.getElementById('imageFile');
    elem.src = imgUri;
}
```

To display the image on some platforms, you might need to include the main part of the URI in the Content-Security-Policy `<meta>` element in index.html. For example, on Windows 10, you can include `ms-appdata:` in your `<meta>` element. Here is an example.

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self' data: gap: ms-appdata: https://ssl.gstatic.com 'unsafe-eval'; style-src 'self' 'unsafe-inline'; media-src *">
```

## Take a Picture and Return Thumbnails (Resize the Picture) <a name="getThumbnails"></a>

To get smaller images, you can return a resized image by passing both `targetHeight` and `targetWidth` values with your CameraOptions object. In this example, you resize the returned image to fit in a 100px by 100px box (the aspect ratio is maintained, so 100px is either the height or width, whichever is greater in the source).

```js
function openCamera(selection) {

    var srcType = Camera.PictureSourceType.CAMERA;
    var options = setOptions(srcType);
    var func = createNewFileEntry;

    if (selection == "camera-thmb") {
        options.targetHeight = 100;
        options.targetWidth = 100;
    }

    navigator.camera.getPicture(function cameraSuccess(imageUri) {

        // Do something

    }, function cameraError(error) {
        console.debug("Unable to obtain picture: " + error, "app");

    }, options);
}
```

## Select a File from the Picture Library <a name="selectFile"></a>

When selecting a file using the file picker, you also need to set the CameraOptions object. In this example, set the `sourceType` to `Camera.PictureSourceType.SAVEDPHOTOALBUM`. To open the file picker, call `getPicture` just as you did in the previous example, passing in the success and error callbacks along with CameraOptions object.

```js
function openFilePicker(selection) {

    var srcType = Camera.PictureSourceType.SAVEDPHOTOALBUM;
    var options = setOptions(srcType);
    var func = createNewFileEntry;

    navigator.camera.getPicture(function cameraSuccess(imageUri) {

        // Do something

    }, function cameraError(error) {
        console.debug("Unable to obtain picture: " + error, "app");

    }, options);
}
```

## Select an Image and Return Thumbnails (resized images) <a name="getFileThumbnails"></a>

Resizing a file selected with the file picker works just like resizing using the Camera app; set the `targetHeight` and `targetWidth` options.

```js
function openFilePicker(selection) {

    var srcType = Camera.PictureSourceType.SAVEDPHOTOALBUM;
    var options = setOptions(srcType);
    var func = createNewFileEntry;

    if (selection == "picker-thmb") {
        // To downscale a selected image,
        // Camera.EncodingType (e.g., JPEG) must match the selected image type.
        options.targetHeight = 100;
        options.targetWidth = 100;
    }

    navigator.camera.getPicture(function cameraSuccess(imageUri) {

        // Do something with image

    }, function cameraError(error) {
        console.debug("Unable to obtain picture: " + error, "app");

    }, options);
}
```
