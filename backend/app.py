from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import nltk
from nltk.tokenize import word_tokenize
from nltk.sentiment import SentimentIntensityAnalyzer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from collections import Counter
import re
import praw
from datetime import datetime
import requests
from textblob import TextBlob
import os
from dotenv import load_dotenv

# ==================== LOAD ENV ====================
load_dotenv()
NEWS_API_KEY = os.getenv("NEWS_API_KEY")
REDDIT_CLIENT_ID = os.getenv("REDDIT_CLIENT_ID")
REDDIT_CLIENT_SECRET = os.getenv("REDDIT_CLIENT_SECRET")
REDDIT_USER_AGENT = os.getenv("REDDIT_USER_AGENT")

# Download NLTK data
nltk.download('punkt', quiet=True)
nltk.download('vader_lexicon', quiet=True)
nltk.download('punkt_tab', quiet=True)

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

sia = SentimentIntensityAnalyzer()

# Initialize Reddit
try:
    if REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET:
        reddit = praw.Reddit(
            client_id=REDDIT_CLIENT_ID,
            client_secret=REDDIT_CLIENT_SECRET,
            user_agent=REDDIT_USER_AGENT
        )
        print(f"✅ Reddit API initialized (Read Only: {reddit.read_only})")
    else:
        print("⚠️ Reddit keys missing in .env")
        reddit = None
except Exception as e:
    print(f"⚠️ Reddit connection failed: {e}")
    reddit = None

# Pre-trained models storage
trained_models = {}
vectorizers = {}
pretrained_ready = False

# ==================== PRE-TRAIN DEFAULT MODELS ====================
# ==================== PRE-TRAIN DEFAULT MODELS (EXPANDED) ====================
def initialize_default_models():
    """Pre-train models on a larger, diverse dataset for better accuracy"""
    global trained_models, vectorizers, pretrained_ready
    
    # Expanded training data covering Tech, Food, E-commerce, and general conversation
    default_data = {
        'review': [
            # --- POSITIVE (Tech/General) ---
            "This is amazing! Absolutely love it!", "Best purchase I've made all year.",
            "Works perfectly out of the box.", "Incredible performance and speed.",
            "Highly recommended for everyone.", "Great value for the money.",
            "The battery life is outstanding.", "Sleek design and feels premium.",
            "Customer service was very helpful.", "Five stars! exceeded expectations.",
            "Simple, elegant, and effective.", "I can't live without this app.",
            "User interface is intuitive and clean.", "A game changer for my workflow.",
            "Fast shipping and great packaging.", "The screen quality is crisp and bright.",
            "Audio quality is superb.", "Very satisfied with this upgrade.",
            "Easy to setup and use immediately.", "Rugged and durable build quality.",

            # --- NEGATIVE (Tech/General) ---
            "Terrible product. Waste of money.", "Stopped working after two days.",
            "Complete garbage. Do not buy.", "Customer support was rude and unhelpful.",
            "The app keeps crashing.", "Battery drains extremely fast.",
            "Laggy and unresponsive.", "Overheats constantly.",
            "Not worth the price tag.", "Very disappointed with the quality.",
            "Cheap plastic feel.", "Instructions were unclear and confusing.",
            "Too many bugs and glitches.", "Worst experience I've ever had.",
            "Defective unit arrived broken.", "False advertising. Does not do what it says.",
            "Connection keeps dropping.", "Update broke everything.",
            "Subscription is too expensive.", "Refund process is a nightmare.",

            # --- NEUTRAL / MIXED ---
            "It's okay. Nothing special.", "Decent product but a bit pricey.",
            "Works fine but has some quirks.", "Average performance for the cost.",
            "Not bad, not great.", "It does the job, I guess.",
            "Good features but poor battery.", "Nice design but slow processor.",
            "Delivery was slow but item is good.", "I have mixed feelings about this.",
            "Standard quality, nothing to write home about.", "It is what it is.",
            "Acceptable for a beginner.", "Middle of the road performance.",
            "The color is different than the picture.", "Passable quality.",
            
            # --- HARD CASES (Sarcasm/Negation) ---
            "I absolutely hate this.", "I do not like this at all.",
            "Not good.", "Not terrible.", # Negation
            "Yeah, right. Like that will ever work.", # Sarcasm (Hard for AI)
            "Oh great, another delay.", # Sarcasm
            "Just what I needed, a broken screen.", # Sarcasm
            "The best way to waste your money.", # Sarcasm
            "I expected worse, honestly.", # Nuance
            "Surprisingly good for the price." # Nuance
        ],
        'sentiment': [
            # POSITIVE
            'Positive', 'Positive', 'Positive', 'Positive', 'Positive', 'Positive', 'Positive', 'Positive', 'Positive', 'Positive',
            'Positive', 'Positive', 'Positive', 'Positive', 'Positive', 'Positive', 'Positive', 'Positive', 'Positive', 'Positive',
            
            # NEGATIVE
            'Negative', 'Negative', 'Negative', 'Negative', 'Negative', 'Negative', 'Negative', 'Negative', 'Negative', 'Negative',
            'Negative', 'Negative', 'Negative', 'Negative', 'Negative', 'Negative', 'Negative', 'Negative', 'Negative', 'Negative',
            
            # NEUTRAL
            'Neutral', 'Neutral', 'Neutral', 'Neutral', 'Neutral', 'Neutral', 'Neutral', 'Neutral', 'Neutral', 'Neutral',
            'Neutral', 'Neutral', 'Neutral', 'Neutral', 'Neutral', 'Neutral',
            
            # HARD CASES
            'Negative', 'Negative', 'Negative', 'Neutral', 
            'Negative', 'Negative', 'Negative', 'Negative', 
            'Positive', 'Positive'
        ]
    }
    
    try:
        df = pd.DataFrame(default_data)
        
        # Increase max_features to learn more words
        vectorizer = TfidfVectorizer(max_features=2000, ngram_range=(1, 2))
        X = vectorizer.fit_transform(df['review'])
        y = df['sentiment']
        
        models = {}
        # Tune models for small data
        models['Logistic Regression'] = LogisticRegression(max_iter=500, C=1.0)
        models['Logistic Regression'].fit(X, y)
        
        models['Naive Bayes'] = MultinomialNB(alpha=0.1) # Lower alpha for small data
        models['Naive Bayes'].fit(X, y)
        
        models['Random Forest'] = RandomForestClassifier(n_estimators=100, max_depth=None)
        models['Random Forest'].fit(X, y)
        
        models['Ensemble'] = VotingClassifier(
            estimators=[
                ('lr', models['Logistic Regression']),
                ('nb', models['Naive Bayes']),
                ('rf', models['Random Forest'])
            ],
            voting='soft'
        )
        models['Ensemble'].fit(X, y)
        
        trained_models.update(models)
        vectorizers['main'] = vectorizer
        pretrained_ready = True
        print("✅ Pre-trained models initialized with EXPANDED dataset!")
        return True
    except Exception as e:
        print(f"⚠️ Warning: Could not initialize models: {e}")
        return False
initialize_default_models()

# ==================== SENTIMENT PREDICTION ====================
def predict_sentiment_multi(text, use_ml=False):
    results = {}
    
    # VADER
    vader_score = sia.polarity_scores(text)["compound"]
    if vader_score >= 0.05: vader_sent = "Positive"
    elif vader_score <= -0.05: vader_sent = "Negative"
    else: vader_sent = "Neutral"
    
    results['VADER'] = {'sentiment': vader_sent, 'confidence': abs(vader_score), 'score': vader_score}
    
    # TextBlob
    blob = TextBlob(text)
    blob_score = blob.sentiment.polarity
    if blob_score > 0.1: blob_sent = "Positive"
    elif blob_score < -0.1: blob_sent = "Negative"
    else: blob_sent = "Neutral"
    
    results['TextBlob'] = {'sentiment': blob_sent, 'confidence': abs(blob_score), 'score': blob_score}
    
    # ML Models
    if use_ml and trained_models and vectorizers.get('main'):
        try:
            vectorizer = vectorizers['main']
            X_test = vectorizer.transform([text])
            for model_name, model in trained_models.items():
                try:
                    pred = model.predict(X_test)[0]
                    proba = max(model.predict_proba(X_test)[0]) if hasattr(model, 'predict_proba') else 0.75
                    results[model_name] = {'sentiment': pred, 'confidence': proba, 'score': proba}
                except:
                    continue
        except Exception as e:
            print(f"ML Prediction Error: {e}")
    
    sentiments = [r['sentiment'] for r in results.values()]
    if not sentiments: return {'algorithms': results, 'consensus': "Neutral", 'agreement': 0}
    
    consensus = max(set(sentiments), key=sentiments.count)
    agreement = sentiments.count(consensus) / len(sentiments)
    
    return {'algorithms': results, 'consensus': consensus, 'agreement': round(agreement * 100, 1)}

def extract_keywords(reviews, sentiments):
    pos_words, neg_words = [], []
    stopwords = {'the', 'is', 'it', 'to', 'and', 'a', 'of', 'in', 'this', 'for', 'not', 'very', 'but', 'that', 'with'}
    
    for text, sent in zip(reviews, sentiments):
        tokens = [t.lower() for t in word_tokenize(text) if t.isalpha() and len(t) > 3]
        tokens = [t for t in tokens if t not in stopwords]
        
        if sent == "Positive": pos_words.extend(tokens)
        elif sent == "Negative": neg_words.extend(tokens)
    
    pos_common = [w for w, _ in Counter(pos_words).most_common(12)]
    neg_common = [w for w, _ in Counter(neg_words).most_common(12)]
    return {"positive": pos_common, "negative": neg_common}

# ==================== DATA SCRAPERS ====================
def scrape_reddit(query, limit=100):
    if not reddit:
        return {"error": "Reddit API not configured"}
    try:
        posts_data = []
        for submission in reddit.subreddit("all").search(query, limit=limit):
            posts_data.append({
                "source": "Reddit", "type": "Post", "user": str(submission.author),
                "text": submission.title, "score": submission.score,
                "created": datetime.fromtimestamp(submission.created_utc).isoformat()
            })
        return posts_data
    except Exception as e:
        return {"error": f"Reddit error: {str(e)}"}

def scrape_news(query, limit=50):
    if not NEWS_API_KEY:
        return {"error": "News API key not configured"}
    try:
        url = "https://newsapi.org/v2/everything"
        params = {'q': query, 'apiKey': NEWS_API_KEY, 'language': 'en', 'pageSize': min(limit, 100)}
        response = requests.get(url, params=params, timeout=10)
        data = response.json()
        
        if response.status_code != 200:
            print(f"🔴 NEWS API ERROR: {data.get('message')}")
            return {"error": f"News API error: {data.get('message')}"}
            
        return [{
            "source": "News", "type": article['source']['name'], "user": article['author'] or "Unknown",
            "text": article['title'], "score": 0, "created": article['publishedAt'], "url": article['url']
        } for article in data.get('articles', [])]
    except Exception as e:
        return {"error": f"News error: {str(e)}"}

# ==================== API ENDPOINTS ====================
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "API is running on Port 5001"})

@app.route('/', methods=['GET'])
def home():
    return "<h1>Backend is running! 🚀</h1><p>Use the React frontend to interact with the API.</p>"

@app.route('/api/analyze', methods=['POST'])
def analyze_multi_source():
    try:
        data = request.get_json()
        query = data.get("query", "")
        sources = data.get("sources", [])
        
        all_posts = []
        source_stats = {}
        
        if "news" in sources:
            posts = scrape_news(query, 50)
            if isinstance(posts, list): all_posts.extend(posts)
            else: source_stats["news"] = posts 
            
        if "reddit" in sources:
            posts = scrape_reddit(query, 50)
            if isinstance(posts, list): all_posts.extend(posts)
            else: source_stats["reddit"] = posts

        # === FIX: RETURN 404 IF NO DATA FOUND (No more fake data) ===
        if not all_posts:
            return jsonify({"error": "No data found for this query. Try a different topic."}), 404

        results = []
        all_algorithm_results = []
        sentiments_by_source = {}

        for post in all_posts[:50]:
            analysis = predict_sentiment_multi(post['text'], use_ml=True)
            results.append({
                **post,
                "sentiment": analysis['consensus'],
                "agreement": analysis['agreement'],
                "algorithms": analysis['algorithms']
            })
            all_algorithm_results.append(analysis['algorithms'])
            source = post["source"]
            if source not in sentiments_by_source: sentiments_by_source[source] = []
            sentiments_by_source[source].append(analysis['consensus'])
            
        # Metrics Calculation
        all_sentiments = [r['sentiment'] for r in results]
        total = len(results)
        
        metrics = {
            "total_posts": total,
            "positive_percent": round(all_sentiments.count("Positive")/total*100, 1),
            "negative_percent": round(all_sentiments.count("Negative")/total*100, 1),
            "neutral_percent": round(all_sentiments.count("Neutral")/total*100, 1),
            "avg_agreement": round(sum(r['agreement'] for r in results) / len(results), 1)
        }

        # Algorithm Stats
        algorithm_stats = {}
        for algo_results in all_algorithm_results:
            for algo_name, algo_data in algo_results.items():
                if algo_name not in algorithm_stats:
                    algorithm_stats[algo_name] = {"Positive": 0, "Negative": 0, "Neutral": 0}
                algorithm_stats[algo_name][algo_data['sentiment']] += 1

        # Source Comparison
        source_comparison = {}
        for source, sents in sentiments_by_source.items():
            total_src = len(sents)
            source_comparison[source] = {
                "total": total_src,
                "positive_percent": round(sents.count("Positive")/total_src*100, 1),
                "negative_percent": round(sents.count("Negative")/total_src*100, 1),
                "neutral_percent": round(sents.count("Neutral")/total_src*100, 1)
            }

        keywords = extract_keywords([r['text'] for r in results], all_sentiments)
            
        return jsonify({
            "success": True,
            "results": results,
            "metrics": metrics,
            "algorithm_stats": algorithm_stats,
            "source_comparison": source_comparison,
            "keywords": keywords,
            "query": query,
            "source_stats": source_stats
        })

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/analyze-text', methods=['POST'])
def analyze_single_text():
    try:
        data = request.get_json()
        text = data.get("text", "")
        if not text or len(text.strip()) < 2:
             return jsonify({"error": "Text is too short"}), 400
             
        analysis = predict_sentiment_multi(text, use_ml=True)
        return jsonify({"success": True, "text": text, **analysis})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# === FIX: ADDED CSV ENDPOINT FROM APP2.PY ===
@app.route('/api/analyze-csv', methods=['POST'])
def analyze_csv():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400
        
        file = request.files['file']
        if not file.filename.endswith('.csv'):
            return jsonify({"error": "File must be a CSV"}), 400
        
        try:
            df = pd.read_csv(file)
        except Exception as e:
            return jsonify({"error": f"Failed to read CSV: {str(e)}"}), 400
        
        if 'review' not in df.columns:
            return jsonify({"error": "CSV must have a 'review' column"}), 400
        
        # Train models if sentiment column exists
        if 'sentiment' in df.columns:
            try:
                vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
                X = vectorizer.fit_transform(df["review"])
                y = df["sentiment"]
                
                models = {}
                models['logistic'] = LogisticRegression(max_iter=200, random_state=42)
                models['logistic'].fit(X, y)
                models['naive_bayes'] = MultinomialNB()
                models['naive_bayes'].fit(X, y)
                models['random_forest'] = RandomForestClassifier(n_estimators=100, random_state=42)
                models['random_forest'].fit(X, y)
                
                trained_models.update(models)
                vectorizers['main'] = vectorizer
            except Exception as e:
                pass
        
        results = []
        sentiments = []
        reviews_text = []
        product_ratings = {}
        
        for idx, row in df.iterrows():
            if idx >= 1000: break
            review = str(row['review'])
            if len(review.strip()) < 5: continue
            
            analysis = predict_sentiment_multi(review, use_ml=True)
            consensus = analysis['consensus']
            
            result = {
                "id": idx,
                "user": str(row.get('user', 'N/A')),
                "product": str(row.get('product', 'N/A')),
                "review": review,
                "sentiment": consensus,
                "agreement": analysis['agreement'],
                "algorithms": analysis['algorithms'],
                "rating": 5 if consensus == "Positive" else 1 if consensus == "Negative" else 3
            }
            results.append(result)
            sentiments.append(consensus)
            reviews_text.append(review)
            
            product = str(row.get('product', 'Unknown'))
            if product not in product_ratings: product_ratings[product] = []
            product_ratings[product].append(result['rating'])
        
        if not results:
            return jsonify({"error": "No valid reviews found in CSV"}), 400
            
        # Calculate metrics (Same as app2.py)
        total = len(sentiments)
        metrics = {
            "total_reviews": total,
            "positive_count": sentiments.count("Positive"),
            "negative_count": sentiments.count("Negative"),
            "neutral_count": sentiments.count("Neutral"),
            "positive_percent": round(sentiments.count("Positive")/total*100, 1),
            "negative_percent": round(sentiments.count("Negative")/total*100, 1),
            "neutral_percent": round(sentiments.count("Neutral")/total*100, 1),
            "avg_agreement": round(sum(r['agreement'] for r in results) / len(results), 1)
        }
        
        product_analysis = {p: {"avg_rating": round(sum(r)/len(r), 2), "count": len(r)} for p, r in product_ratings.items()}
        keywords = extract_keywords(reviews_text, sentiments)
        
        algorithm_stats = {}
        for res in results:
            for algo, data in res['algorithms'].items():
                if algo not in algorithm_stats: algorithm_stats[algo] = {"Positive": 0, "Negative": 0, "Neutral": 0}
                algorithm_stats[algo][data['sentiment']] += 1

        return jsonify({
            "success": True,
            "results": results[:500],
            "metrics": metrics,
            "product_analysis": product_analysis,
            "keywords": keywords,
            "algorithm_stats": algorithm_stats,
            "total_rows": len(df),
            "processed_rows": len(results)
        })

    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

if __name__ == "__main__":
    print("🚀 Starting Flask API on http://localhost:5001")
    app.run(debug=True, port=5001)