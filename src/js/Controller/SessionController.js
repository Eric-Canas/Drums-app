/**
 * Copyright (c) 2021
 *
 * Summary. Controls all the logic for managing the exercise that is being performed as well as
 *          the transitions between exercises.
 * Description. Controls all the logic for managing the exercise that is being performed as well as
 *              the transitions between exercises.
 * 
 * @author Eric Cañas <elcorreodeharu@gmail.com>
 * @file   This file defines the ExerciseController class.
 * @since  0.0.1
 */

 import {END_SESSION_BUTTON_ID, SAVE_DATASET_CANVAS_ID} from "../Model/Constants.js";
 import {WebcamController} from "../Controller/WebcamController.js";
 import {WebcamCanvas} from "../View/WebcamCanvas.js";
 import {MovementStateController} from "../Controller/MovementStateController.js";
 import {FrequencyChart} from "../View/FrequencyChart.js";
 import {PosePainter} from "../Helpers/PosePainter.js";
 import {HandPoseController} from "../Controller/HandPoseController.js";
 import {SoundInterface} from './SoundInterface.js'

 class SessionController{
    //To avoid the creation of diverse SessionControllers, it is a singleton
    static instance;

    constructor(endSessionButtonID = END_SESSION_BUTTON_ID, saveDatasetCanvasID = SAVE_DATASET_CANVAS_ID){
        if (this.constructor.instance){
            return instance
        } else {
            // --------------------------- VIEWS ---------------------------------------
            this.webcamCanvas = new WebcamCanvas();
            this.frequencyChart = new FrequencyChart();
            // // ---------------------- CONTROLLERS -----------------------------------
            this.webcamController = new WebcamController();
            this.soundInterface = new SoundInterface();
            this.movementStateController = new MovementStateController(this.soundInterface);
            //this.posePainter = new PosePainter(this.webcamCanvas, this.movementStateController);
            // ------------------- CREATE HANDS DETECTION NETWORK -----------------------
            this.onDetectionCallbacks = [this.frequencyChart.updateChart.bind(this.frequencyChart), this.movementStateController.updateState.bind(this.movementStateController)]
            this.handPoseController = new HandPoseController(this.webcamController, this.onDetectionCallbacks);
            //this.handPoseController.callbacksOnPoseCaptured.push(this.posePainter.drawPose.bind(this.posePainter));
            
            this.constructor.instance = this
        }
    }

    
    endSession(){
        this.poseNetController.disable();
        this.webcamCanvas.canvas.style.background = "black"
    }
    


}

export {SessionController};