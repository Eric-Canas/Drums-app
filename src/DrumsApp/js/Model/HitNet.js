
import {IS_HIT_CONFIDENCE_THRESHOLD, HIT_NET_PATH} from './Constants.js'

const JSON_PATH = "../public/resources/model/model.json";
const BIN_PATH = "../public/resources/model/group1-shard1of1.bin";

class HitNet{
    constructor(){
        this.jsonFile = document.getElementById("json");
        this.binFile = document.getElementById("bin");
        this.hitNet = null;
        this._loadModel();
    }
    async _loadModel(){
        const json = await fetch(JSON_PATH);
        const bin = await fetch(BIN_PATH);
        // Get blobs
        const jsonBlob = await json.blob();
        const binBlob = await bin.blob();
        console.log(jsonBlob, binBlob);
        // Create file objects
        const jsonFile = new File([jsonBlob], "model.json");
        const binFile = new File([binBlob], "group1-shard1of1.bin");
        this.hitNet = await tf.loadLayersModel(tf.io.browserFiles(
            [jsonFile, binFile]));
        console.log("HitNet Charged");
    }

    isHit(x, threshold = IS_HIT_CONFIDENCE_THRESHOLD) {
        if(this.hitNet !== null){
            const tensor = tf.tensor3d([x]);// [] for declaring a first batch dimension of size 1
            let prediction = this.hitNet.predict(tensor);
            prediction = prediction.dataSync()[0];
            console.log(prediction, prediction > threshold);
            return prediction > threshold;
        } else {
            return false;
        }

    }
}

export {HitNet};