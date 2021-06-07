/**
 * Copyright (c) 2021
 *
 * Summary. Controls the webcam.
 * Description. Controls the webcam. It allows to access to the videoStream and its information
 *              (width, height, framerate...).
 * 
 * @author Eric Cañas <elcorreodeharu@gmail.com>
 * @file   This file defines the WebcamController class.
 * @since  0.0.1
 */
import {DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT, WEBCAM_FRAME_ID} from "../Model/Constants.js";

class WebcamController{
    constructor(videoID=WEBCAM_FRAME_ID){
        this.videoStream = document.getElementById(videoID);
        if (navigator.mediaDevices.getUserMedia) {
            this.webcamPromise = navigator.mediaDevices.getUserMedia({ video: true });
            this.webcamPromise.then(stream => this.videoStream.srcObject = stream)
                              .catch(error => this._noWebcamAccessError(error));
        
        this.width = 1;
        this.height = 1;
        this.videoStream.addEventListener('loadedmetadata', this.updateVideoParameters.bind(this), false);
        } else {
            this.webcamPromise = null;
        }
    }
    
    _noWebcamAccessError(error){
        this.webcamPromise = null;
        this.videoStream.srcObject = null;
        alert(`Impossible to access to the camera :( --> ${error}`);
    }

    updateVideoParameters(){
        this.width = this.videoStream.videoWidth;
        this.height = this.videoStream.videoHeight;
    }
}
export {WebcamController};