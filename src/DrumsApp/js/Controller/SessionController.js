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

 import {WebcamController} from "../Controller/WebcamController.js";
 import {WebcamCanvas} from "../View/WebcamCanvas.js";
 import {MovementStateController} from "../Controller/MovementStateController.js";
 import {HandPoseController} from "../Controller/HandPoseController.js";
 import {SoundBoxes} from './SoundBoxes.js'

 class SessionController{
    //To avoid the creation of diverse SessionControllers, it is a singleton
    static instance;

    constructor(){
        if (this.constructor.instance){
            return instance
        } else {
            // ----------------------- WEBCAM CONTROLLER -------------------------------
            this.webcamController = new WebcamController();
            // --------------------------- VIEWS ---------------------------------------
            this.webcamCanvas = new WebcamCanvas(this.webcamController);
            // ------------------------- CONTROLLERS -----------------------------------
            this.soundBoxes = new SoundBoxes(this.webcamCanvas);
            this.movementStateController = new MovementStateController(this.soundBoxes);
            
            // ------------------- CREATE HANDS DETECTION NETWORK -----------------------
            this.onDetectionCallbacks = [this.movementStateController.updateState.bind(this.movementStateController)]
            this.handPoseController = new HandPoseController(this.webcamController, this.onDetectionCallbacks);
            
            this.constructor.instance = this
        }
    }

    
    endSession(){
        this.poseNetController.disable();
        this.webcamCanvas.canvas.style.background = "black"
    }
    


}

export {SessionController};