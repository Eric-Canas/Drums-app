from keras.losses import BinaryCrossentropy

binary_cross_entropy = BinaryCrossentropy(from_logits=False, reduction="auto", name="binary_crossentropy")
weigth_mul = 40

def loss(y_true, y_pred):
    return binary_cross_entropy(y_true=y_true, y_pred=y_pred, sample_weight=(y_true*weigth_mul)+1)

