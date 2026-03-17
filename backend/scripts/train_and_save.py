"""
Script to train NB, LR, SVM models on IMDb dataset and serialize with joblib.

Usage:
    python -m backend.scripts.train_and_save

Output:
    backend/models/tfidf_vectorizer.joblib
    backend/models/naive_bayes.joblib
    backend/models/logistic_regression.joblib
    backend/models/svm.joblib
"""

import os
import sys
import time
import joblib

def train_and_save():
    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.naive_bayes import MultinomialNB
        from sklearn.linear_model import LogisticRegression
        from sklearn.svm import LinearSVC
        from sklearn.metrics import accuracy_score, classification_report
    except ImportError:
        print("ERROR: scikit-learn is not installed. Run: pip install scikit-learn")
        sys.exit(1)

    try:
        from datasets import load_dataset
    except ImportError:
        print("ERROR: datasets is not installed. Run: pip install datasets")
        sys.exit(1)

    models_dir = os.path.join(os.path.dirname(__file__), "..", "models")
    os.makedirs(models_dir, exist_ok=True)

    print("=" * 60)
    print("  Training Sentiment Analysis Models - IMDb Dataset")
    print("=" * 60)

    # 1. Load dataset
    print("\n[1/7] Loading IMDb dataset from Hugging Face...")
    dataset = load_dataset("imdb")
    train_texts = dataset["train"]["text"]
    train_labels = dataset["train"]["label"]
    test_texts = dataset["test"]["text"]
    test_labels = dataset["test"]["label"]
    print(f"  Train: {len(train_texts)} | Test: {len(test_texts)}")

    # 2. TF-IDF Vectorization
    print("\n[2/7] Fitting TF-IDF vectorizer...")
    t0 = time.time()
    vectorizer = TfidfVectorizer(
        max_features=50000,
        ngram_range=(1, 2),
        min_df=2,
        max_df=0.95,
        sublinear_tf=True,
        strip_accents="unicode",
    )
    X_train = vectorizer.fit_transform(train_texts)
    X_test = vectorizer.transform(test_texts)
    print(f"  Vocabulary size: {len(vectorizer.vocabulary_)}")
    print(f"  Matrix shape: {X_train.shape}")
    print(f"  Time: {time.time() - t0:.2f}s")

    # Save vectorizer
    vectorizer_path = os.path.join(models_dir, "tfidf_vectorizer.joblib")
    joblib.dump(vectorizer, vectorizer_path, compress=3)
    print(f"  Saved: {vectorizer_path}")

    # 3. Train Naive Bayes
    print("\n[3/7] Training Naive Bayes...")
    t0 = time.time()
    nb = MultinomialNB()
    nb.fit(X_train, train_labels)
    nb_time = time.time() - t0
    nb_pred = nb.predict(X_test)
    nb_acc = accuracy_score(test_labels, nb_pred)
    print(f"  Accuracy: {nb_acc:.4f} ({nb_acc*100:.2f}%)")
    print(f"  Time: {nb_time:.2f}s")
    joblib.dump(nb, os.path.join(models_dir, "naive_bayes.joblib"), compress=3)

    # 4. Train Logistic Regression
    print("\n[4/7] Training Logistic Regression...")
    t0 = time.time()
    lr = LogisticRegression(max_iter=1000, C=1.0)
    lr.fit(X_train, train_labels)
    lr_time = time.time() - t0
    lr_pred = lr.predict(X_test)
    lr_acc = accuracy_score(test_labels, lr_pred)
    print(f"  Accuracy: {lr_acc:.4f} ({lr_acc*100:.2f}%)")
    print(f"  Time: {lr_time:.2f}s")
    joblib.dump(lr, os.path.join(models_dir, "logistic_regression.joblib"), compress=3)

    # 5. Train SVM
    print("\n[5/7] Training SVM (LinearSVC)...")
    t0 = time.time()
    svm = LinearSVC(max_iter=2000, C=1.0)
    svm.fit(X_train, train_labels)
    svm_time = time.time() - t0
    svm_pred = svm.predict(X_test)
    svm_acc = accuracy_score(test_labels, svm_pred)
    print(f"  Accuracy: {svm_acc:.4f} ({svm_acc*100:.2f}%)")
    print(f"  Time: {svm_time:.2f}s")
    joblib.dump(svm, os.path.join(models_dir, "svm.joblib"), compress=3)

    # 6. Print summary
    print("\n[6/7] Summary:")
    print(f"  {'Model':<25} {'Accuracy':>10} {'Train Time':>12}")
    print(f"  {'-'*47}")
    print(f"  {'Naive Bayes':<25} {nb_acc*100:>9.2f}% {nb_time:>10.2f}s")
    print(f"  {'Logistic Regression':<25} {lr_acc*100:>9.2f}% {lr_time:>10.2f}s")
    print(f"  {'SVM (LinearSVC)':<25} {svm_acc*100:>9.2f}% {svm_time:>10.2f}s")

    # 7. Print classification reports
    print("\n[7/7] Classification Reports:")
    label_names = ["negativo", "positivo"]
    for name, pred in [("Naive Bayes", nb_pred), ("Logistic Regression", lr_pred), ("SVM", svm_pred)]:
        print(f"\n  --- {name} ---")
        print(classification_report(test_labels, pred, target_names=label_names))

    print("=" * 60)
    print("  All models saved to backend/models/")
    print("  Restart the backend to use real predictions.")
    print("=" * 60)


if __name__ == "__main__":
    train_and_save()
