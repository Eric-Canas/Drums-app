import {AUDIO_FILES, MAXIMUM_SIMULTANEOUS_AUDIOS_PER_INSTRUMENT, MAX_FREQUENCY_IN_FRAMES} from '../Model/Constants.js'
class SoundInterface{
    constructor(soundFiles = AUDIO_FILES){
        this.audios = {};
        for (const [name, file] of Object.entries(soundFiles)){
            const audio = new Audio(file);
            audio.onplay = () => {this.audios[name].shift();}
            audio.onended = () => {this.audios[name].push(audio);}
            this.audios[name] = [audio];
            for(let i=0; i < MAXIMUM_SIMULTANEOUS_AUDIOS_PER_INSTRUMENT-1; i++){
                const audio2 = new Audio(file);
                audio2.onplay = () => {this.audios[name].shift();}
                audio2.onended = () => {this.audios[name].push(audio2);}
                this.audios[name].push(audio2);
            }
        }
    }

    async playSound(key='hihat'){
        this.audios[key][0].play();
    }
}
export {SoundInterface};