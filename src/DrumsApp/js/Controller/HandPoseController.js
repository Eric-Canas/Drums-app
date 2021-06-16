/**
 * Copyright (c) 2021
 *
 * Summary. Manages the loading and estimations of the Hands Network
 * Description. The HandPoseController class is in charge of loading the Hands model,
 *              from the mediapipe hub, and constantly estimate a hands position from the current
 *              frame of the given videoStream. Additionally, every time that a hand is detected,
 *              it executes the set of callbacks passed as argument in the constructor.
 * 
 * @author Eric Cañas <elcorreodeharu@gmail.com>
 * @file   This file defines the HandPoseController class.
 * @since  0.0.1
 */
import {getHandsForTraining} from '../Helpers/Utils.js'

class HandPoseController{
    /**
     * 
     * 
     * @param {WebcamController} webcamController  : Controller of the webcam. Containing the videoStream information as well as other 
     *                                               webcam parameters such as the width and height of the video captured.
     * @param {Array} callbacksOnPoseCaptured : Array of callbacks containing the functions that must be triggered
     *                                          every time that a gabd is captured. Those callbacks must receive
     *                                          as first argument an array representing all 21 the [x, y, z] vectors 
     *                                          for every hand landmark.
     */
    constructor(webcamController, callbacksOnPoseCaptured = []){
        this.webcamController = webcamController;
        this.callbacksOnPoseCaptured = callbacksOnPoseCaptured;
        this.handsNet = null;
        this._disable = false;
        this._loadHandsNet();
        this._poseEvent = new CustomEvent('posecaptured')
        document.addEventListener('posecaptured', this.capturePose.bind(this), false);
    }

    async onResults(pose) {
        //Convert it to the HandsNet format to a 2D Array
        const results = getHandsForTraining(pose);
        if (Object.keys(results).length > 0){
            for (const callback of this.callbacksOnPoseCaptured){ 
                callback(results);
            }
        }
        //Set an small time out for avoiding the app to block.
        setTimeout(()=> document.dispatchEvent(this._poseEvent), 5);
    }

    /**
     * Loads posenet and assign it to this.poseNet. Then (once videoStream is loaded) starts the capturePose bucle.
     */
    async _loadHandsNet(options = {maxNumHands: 2, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5}){
        this.handsNet = await new Hands({locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
          }});

        this.handsNet.setOptions(options);
        this.handsNet.onResults(this.onResults.bind(this));
        this.webcamController.videoStream.addEventListener('loadeddata', event => this.capturePose());
        
    }
    
    async capturePose(event){
            this.handsNet.send({image : this.webcamController.videoStream});
    }

}

export {HandPoseController};