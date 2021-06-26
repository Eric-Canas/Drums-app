let iconCorrespondeces = [{"img_name" : 'drum.png',
                             "sounds" : ['bum', 'bom', 'bam'],
                             "default_sound" : "bum"},
                             {"img_name" : 'hihat.png',
                             "sounds" : ['hihat', 'tsss'],
                              "default_sound" : "hihat"
                            }
                            ];
const assignSoundButtonID = "AssingSoundButton";
const acceptedImgTypes = "image/*";
const acceptedAudio = "audio/mp3";
//All these variables will have access to the canvas "this"
const assignOptions = [{"name" : "Delete", "events" : {"click" : deleteCallback}},
                        {"name" : "Assign Sound", "events" : {"click" : openAssignSoundMenuClick, "mouseenter" : openAssignSoundMenuEnter,
                        "mouseout" : assignMenuOnMouseOut}, "assignID" : assignSoundButtonID}];

let soundCorrespondences = {'bum' : 'drum1.mp3', 'bom' : 'drum1.mp3', 'bam' : 'drum1.mp3', 'hihat' : 'drum1.mp3', 'tssss' : 'drum1.mp3'};

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
    const imgElement = document.createElement('img')
    imgElement.src = URL.createObjectURL(imgURL);
    if (onload !== null) imgElement.onload = ((event) => {onload(event); imgElement.onload = null});
    iconCorrespondeces.push({"img_name" : imgURL, "sounds" : ['bum', 'bom', 'bam'],
    "default_sound" : "bum", "img_element" : imgElement});
}

function addMp3(name, blob){
    console.log(name)
    const sound = new Audio(blob);
    soundCorrespondences[name] = sound;
}

async function reproduceSound(soundID, path='resources'){
    if (typeof(soundCorrespondences[soundID]) === 'string'){
        const sound = new Audio(`${path}/${soundCorrespondences[soundID]}`);
        soundCorrespondences[soundID] = sound;
    }
    soundCorrespondences[soundID].cloneNode(true).play();
}