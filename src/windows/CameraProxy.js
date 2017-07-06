/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 * Modifications for Tabris.js by EclipseSource Inc.
 */

/*jshint unused:true, undef:true, browser:true */
/*global Windows:true, URL:true, module:true, require:true, WinJS:true */


var Camera = require('./Camera');


var getAppData = function () {
    return Windows.Storage.ApplicationData.current;
};
var encodeToBase64String = function (buffer) {
    return Windows.Security.Cryptography.CryptographicBuffer.encodeToBase64String(buffer);
};
var OptUnique = Windows.Storage.CreationCollisionOption.generateUniqueName;
var CapMSType = Windows.Media.Capture.MediaStreamType;
var webUIApp = Windows.UI.WebUI.WebUIApplication;
var fileIO = Windows.Storage.FileIO;
var pickerLocId = Windows.Storage.Pickers.PickerLocationId;

module.exports = {

    // args will contain :
    //  ...  it is an array, so be careful
    // 0 quality:50,
    // 1 destinationType:Camera.DestinationType.FILE_URI,
    // 2 sourceType:Camera.PictureSourceType.CAMERA,
    // 3 targetWidth:-1,
    // 4 targetHeight:-1,
    // 5 encodingType:Camera.EncodingType.JPEG,
    // 6 mediaType:Camera.MediaType.PICTURE,
    // 7 allowEdit:false,
    // 8 correctOrientation:false,
    // 9 saveToPhotoAlbum:false,
    // 10 popoverOptions:null
    // 11 cameraDirection:0

    takePicture: function (successCallback, errorCallback, args) {
        var sourceType = args[2];

        if (sourceType != Camera.PictureSourceType.CAMERA) {
            takePictureFromFile(successCallback, errorCallback, args);
        } else {
            takePictureFromCamera(successCallback, errorCallback, args);
        }
    }
};

// https://msdn.microsoft.com/en-us/library/windows/apps/ff462087(v=vs.105).aspx
var windowsVideoContainers = [".avi", ".flv", ".asx", ".asf", ".mov", ".mp4", ".mpg", ".rm", ".srt", ".swf", ".wmv", ".vob"];

// Default aspect ratio 1.78 (16:9 hd video standard)
var DEFAULT_ASPECT_RATIO = '1.8';

// Highest possible z-index supported across browsers. Anything used above is converted to this value.
var HIGHEST_POSSIBLE_Z_INDEX = 2147483647;

// Because of asynchronous method, so let the successCallback be called in it.
function resizeImageBase64(successCallback, errorCallback, file, targetWidth, targetHeight) {
    fileIO.readBufferAsync(file).done( function(buffer) {
        var strBase64 = encodeToBase64String(buffer);
        var imageData = "data:" + file.contentType + ";base64," + strBase64;

        var image = new Image();
        image.src = imageData;

        image.onload = function() {
            var ratio = Math.min(targetWidth / this.width, targetHeight / this.height);
            var imageWidth = ratio * this.width;
            var imageHeight = ratio * this.height;
            var canvas = document.createElement('canvas');

            canvas.width = imageWidth;
            canvas.height = imageHeight;

            var ctx = canvas.getContext("2d");
            ctx.drawImage(this, 0, 0, imageWidth, imageHeight);

            // The resized file ready for upload
            var finalFile = canvas.toDataURL(file.contentType);

            // Remove the prefix such as "data:" + contentType + ";base64," , in order to meet the Cordova API.
            var arr = finalFile.split(",");
            var newStr = finalFile.substr(arr[0].length + 1);
            successCallback(newStr);
        };
    }, function(err) { errorCallback(err); });
}

function takePictureFromFile(successCallback, errorCallback, args) {
    var mediaType = args[6],
        destinationType = args[1],
        targetWidth = args[3],
        targetHeight = args[4],
        encodingType = args[5];

    var fileOpenPicker = new Windows.Storage.Pickers.FileOpenPicker();
    if (mediaType == Camera.MediaType.PICTURE) {
        fileOpenPicker.fileTypeFilter.replaceAll([".png", ".jpg", ".jpeg"]);
        fileOpenPicker.suggestedStartLocation = pickerLocId.picturesLibrary;
    }
    else if (mediaType == Camera.MediaType.VIDEO) {
        fileOpenPicker.fileTypeFilter.replaceAll(windowsVideoContainers);
        fileOpenPicker.suggestedStartLocation = pickerLocId.videosLibrary;
    }
    else {
        fileOpenPicker.fileTypeFilter.replaceAll(["*"]);
        fileOpenPicker.suggestedStartLocation = pickerLocId.documentsLibrary;
    }

    fileOpenPicker.pickSingleFileAsync().done(function (file) {
        if (!file) {
            errorCallback("User didn't choose a file.");
            return;
        }
        if (destinationType == Camera.DestinationType.FILE_URI || destinationType == Camera.DestinationType.NATIVE_URI) {
            if (targetHeight > 0 && targetWidth > 0) {
                resizeImage(successCallback, errorCallback, file, targetWidth, targetHeight, encodingType);
            }
            else {
                var storageFolder = getAppData().localFolder;
                file.copyAsync(storageFolder, file.name, Windows.Storage.NameCollisionOption.replaceExisting).done(function (storageFile) {
                        if(destinationType == Camera.DestinationType.NATIVE_URI) {
                            successCallback("ms-appdata:///local/" + storageFile.name);
                        }
                        else {
                            successCallback(URL.createObjectURL(storageFile));
                        }
                }, function () {
                    errorCallback("Can't access localStorage folder.");
                });
            }
        }
        else {
            if (targetHeight > 0 && targetWidth > 0) {
                resizeImageBase64(successCallback, errorCallback, file, targetWidth, targetHeight);
            } else {
                fileIO.readBufferAsync(file).done(function (buffer) {
                    var strBase64 =encodeToBase64String(buffer);
                    successCallback(strBase64);
                }, errorCallback);
            }
        }
    }, function () {
        errorCallback("User didn't choose a file.");
    });
}

function takePictureFromCamera(successCallback, errorCallback, args) {
    var destinationType = args[1],
        targetWidth = args[3],
        targetHeight = args[4],
        encodingType = args[5],
        allowCrop = !!args[7],
        saveToPhotoAlbum = args[9],
        WMCapture = Windows.Media.Capture,
        cameraCaptureUI = new WMCapture.CameraCaptureUI();

    cameraCaptureUI.photoSettings.allowCropping = allowCrop;

    if (encodingType == Camera.EncodingType.PNG) {
        cameraCaptureUI.photoSettings.format = WMCapture.CameraCaptureUIPhotoFormat.png;
    } else {
        cameraCaptureUI.photoSettings.format = WMCapture.CameraCaptureUIPhotoFormat.jpeg;
    }

    // decide which max pixels should be supported by targetWidth or targetHeight.
    var maxRes = null;
    var cropRes = allowCrop ? { width: targetWidth, height: targetHeight } : { width: 0, height: 0 };
    var UIMaxRes = WMCapture.CameraCaptureUIMaxPhotoResolution;
    var totalPixels = targetWidth * targetHeight;

    if (targetWidth == -1 && targetHeight == -1) {
        maxRes = UIMaxRes.highestAvailable;
        cropRes = { width: 0, height: 0 };
    }
    // Temp fix for CB-10539
    /*else if (totalPixels <= 320 * 240) {
        maxRes = UIMaxRes.verySmallQvga;
    }*/
    else if (totalPixels <= 640 * 480) {
        maxRes = UIMaxRes.smallVga;
    } else if (totalPixels <= 1024 * 768) {
        maxRes = UIMaxRes.mediumXga;
    } else if (totalPixels <= 3 * 1000 * 1000) {
        maxRes = UIMaxRes.large3M;
    } else if (totalPixels <= 5 * 1000 * 1000) {
        maxRes = UIMaxRes.veryLarge5M;
    } else {
        maxRes = UIMaxRes.highestAvailable;
    }

    cameraCaptureUI.photoSettings.maxResolution = maxRes;
    cameraCaptureUI.photoSettings.croppedSizeInPixels = cropRes;

    var cameraPicture;

    cameraCaptureUI.captureFileAsync(WMCapture.CameraCaptureUIMode.photo).done(function (picture) {
        if (!picture) {
            errorCallback("User didn't capture a photo.");
            return;
        }
        cameraPicture = picture;

        savePhoto(cameraPicture, {
            destinationType: destinationType,
            targetHeight: targetHeight,
            targetWidth: targetWidth,
            encodingType: encodingType,
            saveToPhotoAlbum: saveToPhotoAlbum
        }, successCallback, errorCallback);

    }, function () {
        errorCallback("Fail to capture a photo.");
    });
}

function savePhoto(picture, options, successCallback, errorCallback) {
    // success callback for capture operation
    var success = function(picture) {
        if (options.destinationType == Camera.DestinationType.FILE_URI || options.destinationType == Camera.DestinationType.NATIVE_URI) {
            //if (options.targetHeight > 0 && options.targetWidth > 0) {
            //  resizeImage(successCallback, errorCallback, picture, options.targetWidth, options.targetHeight, options.encodingType);
            //} else {
            picture.copyAsync(getAppData().localFolder, picture.name, OptUnique).done(function(copiedFile) {
                successCallback("ms-appdata:///local/" + copiedFile.name);
            }, errorCallback);
    //        }
        } else {
            //if (options.targetHeight > 0 && options.targetWidth > 0) {
            //  resizeImageBase64(successCallback, errorCallback, picture, options.targetWidth, options.targetHeight);
            //} else {
            fileIO.readBufferAsync(picture).done(function(buffer) {
                var strBase64 = encodeToBase64String(buffer);
                picture.deleteAsync().done(function() {
                successCallback(strBase64);
                }, function(err) {
                errorCallback(err);
                });
            }, errorCallback);
    //        }
      }
  };

    if (!options.saveToPhotoAlbum) {
        success(picture);
        return;
    } else {
        var savePicker = new Windows.Storage.Pickers.FileSavePicker();
        var saveFile = function(file) {
            if (file) {
                // Prevent updates to the remote version of the file until we're done
                Windows.Storage.CachedFileManager.deferUpdates(file);
                picture.moveAndReplaceAsync(file)
                    .then(function() {
                        // Let Windows know that we're finished changing the file so
                        // the other app can update the remote version of the file.
                        return Windows.Storage.CachedFileManager.completeUpdatesAsync(file);
                    })
                    .done(function(updateStatus) {
                        if (updateStatus === Windows.Storage.Provider.FileUpdateStatus.complete) {
                            success(picture);
                        } else {
                            errorCallback("File update status is not complete.");
                        }
                    }, errorCallback);
            } else {
                errorCallback("Failed to select a file.");
            }
        };
        savePicker.suggestedStartLocation = pickerLocId.picturesLibrary;

        if (options.encodingType === Camera.EncodingType.PNG) {
            savePicker.fileTypeChoices.insert("PNG", [".png"]);
            savePicker.suggestedFileName = "photo.png";
        } else {
            savePicker.fileTypeChoices.insert("JPEG", [".jpg"]);
            savePicker.suggestedFileName = "photo.jpg";
        }

        savePicker.pickSaveFileAsync()
            .done(saveFile, errorCallback);
    }
}

require("cordova/exec/proxy").add("Camera",module.exports);
