/**
 * Copyright (c) 2021
 *
 * Summary. Defines the configuration for the project.
 * Description. Defines the constants that will be used through the project.
 *              In this way all the internal configuration is gathered here. 
 * 
 * @author Eric Cañas <elcorreodeharu@gmail.com>
 * @file   This file defines the constants of the project.
 * @since  0.0.1
 */

//HTML IDs
const WEBCAM_FRAME_ID = 'webcamFrame';
const WEBCAM_CANVAS_ID = 'webcamCanvas';
const CHART_CANVAS_ID = 'chartCanvas';
const BEGIN_SESSION_BUTTON_ID = 'beginSessionButtonId';
const END_SESSION_BUTTON_ID = 'endSessionButtonId';
const SAVE_DATASET_CANVAS_ID = 'saveDatasetCanvas';
const TAG_LAPSE_ID = 'tagLapseId';

export {WEBCAM_CANVAS_ID, WEBCAM_FRAME_ID, CHART_CANVAS_ID, END_SESSION_BUTTON_ID, BEGIN_SESSION_BUTTON_ID, SAVE_DATASET_CANVAS_ID, TAG_LAPSE_ID};

// Frequency constants
const MAX_FREQUENCY_IN_FRAMES = 300;
const MAX_FREQ_RANGE = [...Array(MAX_FREQUENCY_IN_FRAMES).keys()];
const META_INFORMATION_WINDOW = ~~(MAX_FREQUENCY_IN_FRAMES/10)
const COUNT_STD_FROM_PERCENTILE = 0.6;
const POINTS_TO_LINE_THRESHOLD = 0.025;
const MILISECONDS_BETWEEN_CONSISTENCY_UPDATES = 250;
export {MAX_FREQUENCY_IN_FRAMES, MAX_FREQ_RANGE, META_INFORMATION_WINDOW,
        COUNT_STD_FROM_PERCENTILE, POINTS_TO_LINE_THRESHOLD, MILISECONDS_BETWEEN_CONSISTENCY_UPDATES};

//Colors
const TRANSPARENT_RED = 'rgba(255, 99, 132, 0.4)';
const TRANSPARENT_BLUE = 'rgba(99, 132, 255, 0.4)';
const TRANSPARENT_WHITE = 'rgba(255, 255, 255, 0.4)'
export {TRANSPARENT_RED, TRANSPARENT_WHITE, TRANSPARENT_BLUE};

// Chart constants
const CHART_LINE_COLOR = 'rgba(255, 99, 132, 1)';
const CHART_BACKGROUND_COLOR = TRANSPARENT_RED;
const CHART_LINE_COLOR2 = 'rgba(99, 132, 255, 1)';
const CHART_BACKGROUND_COLOR2 = TRANSPARENT_BLUE;
const CHART_LABEL = 'Frequency';
const INVERT_Y_AXIS = false;
const INVERT_X_AXIS = true;
export {CHART_LINE_COLOR, CHART_BACKGROUND_COLOR, CHART_LINE_COLOR2, CHART_BACKGROUND_COLOR2, CHART_LABEL, INVERT_Y_AXIS, INVERT_X_AXIS};


//Video Canvas constants
const DEFAULT_CANVAS_HEIGHT = 480;
const DEFAULT_CANVAS_WIDTH = 600;
const DRAWN_POINTS_RADIUS = 6;
const SHOW_STD_DIRECTION = true;
const PLOT_BASE_POSE = true;
export {DEFAULT_CANVAS_HEIGHT, DEFAULT_CANVAS_WIDTH, DRAWN_POINTS_RADIUS, SHOW_STD_DIRECTION, 
        PLOT_BASE_POSE};


//PoseNet constants
const MIN_PART_CONFIDENCE = 0.4;
const MIN_WRIST_CONFIDENCE = 0.5;
const LEFT = "Left";
const RIGHT = "Right";
const HIT_WINDOW = 4;
const NOISE_KERNEL = 3;
const MIN_TOP_TO_BOTTOM_HIT_DISTANCE = 0.025;
const IS_HIT_CONFIDENCE_THRESHOLD = 0.5;
const HIT_NET_PATH = "http://127.0.0.1:8000/model.json"; 
                       //Thumb (x, y), Index (x, y), Middle (x, y), Ring (x, y) 
const RELEVANT_MARKS = [[3*3, 3*3+1], [6*3, 6*3+1], [10*3, 10*3+1]];
const MOST_RELEVANT_HANDS_OF_SEQUENCE = [3, 2, 1, 0];

export {MIN_PART_CONFIDENCE, RIGHT, LEFT, MIN_WRIST_CONFIDENCE, HIT_WINDOW, NOISE_KERNEL,
        MIN_TOP_TO_BOTTOM_HIT_DISTANCE, RELEVANT_MARKS, MOST_RELEVANT_HANDS_OF_SEQUENCE, IS_HIT_CONFIDENCE_THRESHOLD, HIT_NET_PATH};


//Others
const EPSILON = 0.0001;
const ROUGH_EPSION = 0.0025;
export {EPSILON, ROUGH_EPSION};
const MAXIMUM_SIMULTANEOUS_AUDIOS_PER_INSTRUMENT = 25;
const AUDIO_FILES = {'hihat' : '../DrumsApp/media/sounds/HiHatOpen2.mp3', 'drum' : '../DrumsApp/media/sounds/drum1.mp3'};
export {AUDIO_FILES, MAXIMUM_SIMULTANEOUS_AUDIOS_PER_INSTRUMENT};