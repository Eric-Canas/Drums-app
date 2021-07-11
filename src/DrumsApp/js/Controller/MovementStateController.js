import {HIT_WINDOW, RIGHT, LEFT, ROUGH_EPSION, MIN_TOP_TO_BOTTOM_HIT_DISTANCE} from "../Model/Constants.js";
import {HitNet} from "../Model/HitNet.js"

class MovementStateController{
    constructor(soundBoxes, onStateUpdatedCallbacks = []){
        this.maxQueueLength = HIT_WINDOW;
        this.HitNet = new HitNet();
        this.handTrack = {}; this.handTrack[RIGHT] = []; this.handTrack[LEFT] = [];
        this.withoutDetections = {}; this.withoutDetections[RIGHT] = 0; this.withoutDetections[LEFT] = 0;
        this.soundBoxes = soundBoxes;
        this.onStateUpdatedCallbacks = onStateUpdatedCallbacks;
    }

    /*Pushes a pose in the buffer and calls all the callbacks*/
    async updateState(fullHands){
        // Include them in the queue
        for (const hand of [RIGHT, LEFT]){
            if(hand in fullHands){
                this.handTrack[hand].push(fullHands[hand].flat());
                if (this.handTrack[hand].length > this.maxQueueLength) {
                    this.handTrack[hand].shift();
                    this.isHit(hand, 'hihat');
                }
                this.withoutDetections[hand] = 0;
            } else {
                if(this.handTrack[hand].length > 0 && this.withoutDetections[hand] > 1){
                    this.handTrack[hand] = [];
                }else{
                    this.withoutDetections[hand]++;
                }
            }
        }
    }


    async isHit(hand, sound='hihat'){  
       const array = this.handTrack[hand];
       // Check if the hand was inside a hittable box at any part of the sequence.
       const hitted_sound_box = this.soundBoxes.hittedSoundBox(array);
       // If entered on a box, run hitNet to verify if the sequence is a hit. (Assume that checking hitted boxes is faster than run the network)
       if (hitted_sound_box !== null && this.HitNet.isHit(array)){
            //Empty the sequence for avoiding multiple repeated hits
            console.log(hitted_sound_box);
            this.handTrack[hand] = [];
            this.soundBoxes.playSound(hitted_sound_box);
            return true;
       }else{
           return false;
       }
    }

}

export {MovementStateController};