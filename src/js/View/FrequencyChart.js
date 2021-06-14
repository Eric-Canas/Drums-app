import {MAX_FREQ_RANGE, MAX_FREQUENCY_IN_FRAMES, RIGHT, LEFT} from "../Model/Constants.js";
import {CHART_LINE_COLOR, CHART_BACKGROUND_COLOR, CHART_LINE_COLOR2, CHART_BACKGROUND_COLOR2, CHART_CANVAS_ID} from "../Model/Constants.js";
import {saveJSON} from "../Helpers/Utils.js"

class FrequencyChart{
    constructor(canvasID = CHART_CANVAS_ID, trainMode = true){
        this.context = document.getElementById(canvasID).getContext('2d');
        this.canvas = document.getElementById(canvasID);
        this.chart = this._buildChart();
        this.actualDataRight = []
        this.actualDataLeft = []
        this.fullHandsRight = []
        this.fullHandsLeft = []
        this.currentLabelsRight = []
        this.currentLabelsLeft = []
        this.datasetXRight = []
        this.datasetXLeft = []
        this.datasetYRight = []
        this.datasetYLeft = []
        this.keyPressed = []
        this.trainMode = trainMode
        if (trainMode){
            this.canvas.onclick = ((event) => this.onClick(event)).bind(this);
            console.log(document.getElementById('save'))
            document.getElementById('save').onclick = this.saveDataset.bind(this);
            document.addEventListener('keydown', (event) => { this.chart.data.datasets[2].data.push(0.2); this.chart.data.datasets[2].data.shift();});
        }
    }

    _buildChart(labelRight = RIGHT, labelLeft = LEFT, backgroundColorRight = CHART_BACKGROUND_COLOR, lineColorRight = CHART_LINE_COLOR,
        backgroundColorLeft = CHART_BACKGROUND_COLOR2, lineColorLeft = CHART_LINE_COLOR2){
        return new Chart(this.context, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: labelRight,
                    data: [],
                    backgroundColor: backgroundColorRight,
                    borderColor: lineColorRight,
                    borderWidth: 1},
                    {
                        label: labelLeft,
                        data: [],
                        backgroundColor: backgroundColorLeft,
                        borderColor: lineColorLeft,
                        borderWidth: 1},
                    {
                        label: 'KeyPressed',
                        data: [],
                        backgroundColor: 'rgba(99, 99, 99, 0.4)',
                        borderColor: 'rgba(99, 99, 99, 0.9)',
                        borderWidth: 1
                    }
                    ]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
    }

    /* Updates the chart visualization by updating the data inside to 'new_data'*/
    updateChart(pose, fullHands){
        const dataRight = this.poseToData(pose, RIGHT);
        
        if (dataRight !== null){
            this.actualDataRight.push(dataRight);
            this.fullHandsRight.push(fullHands[RIGHT]);
            this.currentLabelsRight.push(0);
            if (this.actualDataRight.length > MAX_FREQUENCY_IN_FRAMES){
                this.actualDataRight.shift();
                this.datasetXRight.push(this.fullHandsRight[0]);
                this.datasetYRight.push(this.currentLabelsRight[0]); 
                this.fullHandsRight.shift();
                this.currentLabelsRight.shift();
            }
            this.chart.data.datasets[2].data.push(0);
            if (this.chart.data.datasets[2].data.length > MAX_FREQUENCY_IN_FRAMES){
                this.chart.data.datasets[2].data.shift();
            }
            this.chart.data.datasets[0].data = this.actualDataRight;
        }

        const dataLeft = this.poseToData(pose, LEFT);
        if (dataLeft !== null){
            this.actualDataLeft.push(dataLeft);
            this.fullHandsLeft.push(fullHands[LEFT]);
            this.currentLabelsLeft.push(0);
            if (this.actualDataLeft.length > MAX_FREQUENCY_IN_FRAMES){
                this.actualDataLeft.shift();
                this.datasetXLeft.push(this.fullHandsLeft[0]);
                this.datasetYLeft.push(this.currentLabelsLeft[0]); 
                this.fullHandsLeft.shift();
                this.currentLabelsLeft.shift();
            }
            if(dataRight === null){
                this.chart.data.datasets[2].data.push(0);
            }
            if (this.chart.data.datasets[2].data.length > MAX_FREQUENCY_IN_FRAMES){
                this.chart.data.datasets[2].data.shift();
            }
            this.chart.data.datasets[1].data = this.actualDataLeft;

        }

        this.chart.data.labels = (Math.max(this.actualDataLeft.length, this.actualDataRight.length) < MAX_FREQ_RANGE.length)? 
                                                    MAX_FREQ_RANGE.slice(0,Math.max(this.actualDataLeft.length, this.actualDataRight.length)): MAX_FREQ_RANGE;
        this.chart.update();
    }

    poseToData(pose, hand){
        if(pose.hasOwnProperty(hand)){
            return pose[hand].y
        } else{
            return null;
        }
    }
    
    onClick(event){
        const activePoint = this.chart.getElementAtEvent(event)[0];
        console.log(activePoint)
        if (activePoint !== undefined){
            const index = activePoint._index;
            const label = this.chart.data.datasets[activePoint._datasetIndex].label;
            if (label === RIGHT){
                this.currentLabelsRight[index] = 1;
            } else {
                this.currentLabelsLeft[index] = 1;
            }
        }
    }

    saveDataset(){
        saveJSON({"LeftX" : this.datasetXLeft, "LeftY" : this.datasetYLeft, "RightX" : this.datasetXRight, "RightY" : this.datasetYRight});
    }
}

export {FrequencyChart};