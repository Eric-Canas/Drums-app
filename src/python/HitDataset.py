import keras
import numpy as np
from utils.constants import *
import os
import tensorflow as tf
import json

training_percent = 0.98
SEED = 0


class HitDataset(keras.utils.Sequence):
    def __init__(self, root_dir=DATASET_DIR, detections_before=DETECTIONS_BEFORE, detections_after=DETECTIONS_AFTER,
                 suavization_y_kernel = None, training = True, batch_size = BATCH_SIZE,
                 data_augmentation = DATA_AUGMENTATION, data_augmentation_ratio = DATA_AUGMENTATION_RATIO,
                 x_slide=DATA_AUG_X_SLIDE_RATIO, y_slide=DATA_AUG_Y_SLIDE_RATIO,  z_slide = DATA_AUG_Z_SLIDE_RATIO):
        # ----------------- ENSURE GPU USAGE -------------------------
        config = tf.compat.v1.ConfigProto()
        config.gpu_options.force_gpu_compatible = True
        config.gpu_options.allow_growth = True
        tf.compat.v1.Session(config=config)
        # ----------------- SAVE PARAMETERS ---------------------------
        self.root_dir = root_dir
        self.detections_before = detections_before
        self.chain_size = detections_before+1+detections_after
        self.smoothing_y_kernel = np.array(suavization_y_kernel, dtype=np.float) if suavization_y_kernel is not None else None
        self.training = training
        self.batch_size = batch_size
        # ----------------- SPLITS TRAIN/VAL --------------------------
        files = np.sort(os.listdir(root_dir))
        np.random.seed(SEED)
        np.random.shuffle(files)
        amount_of_files = int(len(files)*training_percent)
        files = files[:amount_of_files] if training else files[amount_of_files:]
        # ------------------ CHARGE DATASET ---------------------------
        self.X, self.Y = self.charge_dataset(files=files, root_dir=root_dir)
        # -------------- SHUFFLE IT FOR FIRST TIME ---------------------------
        self.idxs = np.arange(0, len(self.X), dtype=np.int64)
        np.random.shuffle(self.idxs)
        self.X, self.Y = self.X[self.idxs], self.Y[self.idxs]
        self.all_x_positions = np.arange(0, self.X.shape[-1], len('xyz'), dtype=np.int)
        self.all_y_positions = np.arange(1, self.X.shape[-1], len('xyz'), dtype=np.int)
        self.all_z_positions = np.arange(2, self.X.shape[-1], len('xyz'), dtype=np.int)
        self.all_batch_positions = np.arange(0, self.batch_size, dtype=np.int)
        self.data_augmentation = data_augmentation
        self.data_augmentation_ratio = min(data_augmentation_ratio*2, 1.0)
        self.y_slide_ratio = y_slide
        self.x_slide_ratio = x_slide
        self.z_slide_ratio = z_slide

    def charge_dataset(self, files, root_dir=DATASET_DIR):
        """
        Process every JSON within root_dir that is in files.
        :param files: List of str. List of files to process. They all must be located at root_dir
        :param root_dir: str (dirpath). Directory where the JSONs of the dataset are located (passed in files)
        :return: Two numpy arrays. X & Y. The input and the ground truth of the network.
        """
        X, Y = [], []
        for file in files:
            path = os.path.join(root_dir, file)
            with open(path, 'r') as f:
                info = json.load(f)
            # For each datafile, iterate along the left and the right hand
            for keyX, keyY in (LEFT_KEYS, RIGHT_KEYS):
                x, y = info[keyX], info[keyY]
                # If there was information about the hand include it in the dataset
                if len(x) > self.chain_size and len(x) == len(y):
                    # Flatten the position of the hand at each time step
                    x = np.reshape(x, (len(x), -1))
                    # Smooth it for improving future accuracy
                    if self.smoothing_y_kernel is not None:
                        y = np.convolve(y, self.smoothing_y_kernel, mode='same')
                    # Cut it directly in the chains that will enter in the network
                    for i in range(len(x)-self.chain_size):
                        X.append(x[i:i+self.chain_size])
                        Y.append(y[i+self.detections_before])
        X, Y = np.array(X, dtype=np.float), np.array(Y, dtype=np.float)
        return X, Y

    def __len__(self):
        return int(len(self.X)/self.batch_size)

    def __getitem__(self, idx):
        real_idx = idx*self.batch_size
        X, Y = self.X[real_idx: real_idx+self.batch_size], self.Y[real_idx: real_idx+self.batch_size]
        if self.data_augmentation and self.training:
            self.batch_data_augmentation(X=X)
        return X, Y

    def batch_data_augmentation(self, X):
        X = self.horizontal_flip(X=X)
        X = self.slide(X=X, idxs=self.all_x_positions, slide_ratio=self.x_slide_ratio)
        X = self.slide(X=X, idxs=self.all_y_positions, slide_ratio=self.y_slide_ratio)
        X = self.slide(X=X, idxs=self.all_z_positions, slide_ratio=self.z_slide_ratio)
        return X

    def horizontal_flip(self, X):
        amount = int(np.random.uniform(low=0, high=self.data_augmentation_ratio) * self.batch_size)
        batch_positions = np.random.choice(self.all_batch_positions, size=amount, replace=False)
        # HORIZONTAL FLIP
        x_batch_entries = X[batch_positions]
        x_batch_entries[..., self.all_x_positions] = np.abs(1 - x_batch_entries[..., self.all_x_positions])
        X[batch_positions] = x_batch_entries
        return X

    def slide(self, X, idxs, slide_ratio):
        amount = int(np.random.uniform(low=0, high=self.data_augmentation_ratio) * self.batch_size)
        batch_positions = np.random.choice(self.all_batch_positions, size=amount, replace=False)
        slide = np.random.uniform(low=-slide_ratio, high=slide_ratio, size=amount)
        # HORIZONTAL FLIP
        x_batch_entries = X[batch_positions]
        x_batch_entries[..., idxs] = x_batch_entries[..., idxs]+slide[..., None, None]
        X[batch_positions] = x_batch_entries
        return X

    def on_epoch_end(self):
        """
        After every epoch shuffles the training set
        :return:
        """
        if self.training:
            np.random.shuffle(self.idxs)
            self.X, self.Y = self.X[self.idxs], self.Y[self.idxs]
