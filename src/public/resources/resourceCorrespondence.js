let iconCorrespondeces = [{"img_name" : 'drum.png',
                             "sounds" : ['bum', 'bom', 'bam'],
                             "default_sound" : "bum"},
                             {"img_name" : 'hihat.png',
                             "sounds" : ['hihat', 'tssss'],
                              "default_sound" : "hihat"}
                         ];

const assignSoundButtonID = "AssingSoundButton";
const acceptedImgTypes = "image/*";
const acceptedAudio = "audio/mp3";

//All these variables will have access to the canvas "this"
const assignOptions = [{"name" : "Delete", "events" : {"click" : deleteCallback}},
                        {"name" : "Copy", "events" : {"click" : copyElement}}, 
                        {"name" : "Assign Sound", "events" : {"click" : openAssignSoundMenuClick, "mouseenter" : openAssignSoundMenuEnter,
                        "mouseout" : assignMenuOnMouseOut}, "assignID" : assignSoundButtonID}];
let soundCorrespondences = {'bum' : 'drum1.mp3', 'bom' : 'drum1.mp3', 'bam' : 'drum1.mp3', 'hihat' : 'drum1.mp3', 'tssss' : 'drum1.mp3'};
let chargedSounds = {};

function addSoundToImgName(img_name, soundName){
    for (i in iconCorrespondeces){
        if(iconCorrespondeces[i]["img_name"] === img_name){
            iconCorrespondeces[i]["sounds"].push(soundName);
            break;
        }
    }
}

function deleteCallback(event){
    //Selected object is always at the last position of placed objects 
     this.placedObjects.pop();
     this.close();
     this.drawCanvas(); 
     //Maybe delete
     this.prevent_next_click = true;
 }

function openAssignSoundMenuClick(event){
    this.drawCanvas();
    //Maybe delete
    this.prevent_next_click=true;
}

function openAssignSoundMenuEnter(event){
    if(this.assignSoundMenu.style.display === 'none' || this.assignSoundMenu.style.display === ''){
        this.openAssignSoundMenu()
    }
}

function assignMenuOnMouseOut(event){
    if(!event.toElement.classList.contains("sound")){
        this.removeMenuContent(this.assignSoundMenu);
    }
}

function addImgToOptions(imgURL, onload = null){
    const imgElement = document.createElement('img');
    imgElement.src = URL.createObjectURL(imgURL);
    if (onload !== null) imgElement.onload = ((event) => {onload(event); imgElement.onload = null});
    iconCorrespondeces.push({"img_name" : imgURL, "sounds" : ['bum', 'bom', 'bam'],
    "default_sound" : "bum", "img_element" : imgElement});
}

function addMp3(name, file){
    soundCorrespondences[name] = file;
    chargedSounds[name] = new Audio(URL.createObjectURL(file));

}

function copyElement(event){
   this.draggingElement = this.last_element_under_mouse;
   this._on_canvas_mouse_up(event);
   this.close();
   this.prevent_next_click = true;
}


function reproduceSound(soundID, path='resources'){
    if (!(soundID in chargedSounds)){
        const sound = new Audio(`${path}/${soundCorrespondences[soundID]}`);
        chargedSounds[soundID] = sound;
    }
    chargedSounds[soundID].cloneNode(false).play();
}