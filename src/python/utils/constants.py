DATASET_DIR = './dataset'
RESULTS_DIR = './results'
LEFT_KEYS = ('LeftX', 'LeftY')
RIGHT_KEYS = ('RightX', 'RightY')


LSTM_LAYERS = 1
N_FEATURES = 63
OUTPUT_SIZE = 1
DROPOUT = 0.75
BATCH_SIZE = 512
DETECTIONS_BEFORE = 2
DETECTIONS_AFTER = 1
N_STEPS = DETECTIONS_BEFORE + 1 + DETECTIONS_AFTER
EPOCHS = 3500
CALLBACKS_PERIOD = 250
DATA_AUGMENTATION = True
DATA_AUGMENTATION_RATIO = 0.75
DATA_AUG_X_SLIDE_RATIO = 0.3
DATA_AUG_Y_SLIDE_RATIO = 0.3
DATA_AUG_Z_SLIDE_RATIO = 0.8