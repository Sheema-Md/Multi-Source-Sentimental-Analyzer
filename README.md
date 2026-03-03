# 🧠 Multi-Source Sentiment Analysis System

A full-stack web application that performs sentiment analysis using a **hybrid NLP + Machine Learning approach**. The system combines multiple algorithms with a consensus-based ensemble method to improve reliability and accuracy.

**Average Accuracy:** 83%

## 🌐 Live Deployment

The application is deployed on Render:

🔗 **Live App:** https://multi-source-sentimental-analyzer.onrender.com

---

### 🔍 Health Check

You can verify the backend status at:


---

## 🚀 Key Features

- Hybrid Rule-Based + ML sentiment analysis  
- Six sentiment analysis algorithms  
- Ensemble voting consensus  
- Real-time News API integration  
- CSV batch sentiment analysis  
- Algorithm-wise comparison & confidence scores  
- Positive/Negative keyword extraction  
- Sentiment distribution visualization  

---

## 🤖 Algorithms Used

- VADER  
- TextBlob  
- Logistic Regression (TF-IDF)  
- Naive Bayes  
- Random Forest  
- Ensemble Voting Classifier  

---

## 🌐 External API Integration

**News API**
- Fetches real-time articles based on search query  
- Language: English  
- Sort Order: PublishedAt  
- Handles rate limiting (100 requests/day – free tier)  
- Graceful error handling  

---

## 🖥 Frontend (React)

### 1️⃣ Multi-Source Analysis Tab
- Source selection checkboxes  
- Search bar with suggestions  
- Comprehensive results dashboard  

### 2️⃣ CSV Upload Tab
- Drag & drop file upload  
- Batch sentiment analysis  
- Paginated results table  

### 3️⃣ Quick Test Tab
- Direct text input  
- Algorithm breakdown cards  
- Confidence score visualization  

---

## 🛠 Tech Stack

**Backend:** Flask, Scikit-learn, NLTK, TextBlob, Pandas  
**Frontend:** React  
**Deployment:** Render (Single Service Architecture)

---

## 📡 API Endpoints

| Endpoint | Method | Description |
|-----------|--------|-------------|
| `/api/analyze` | POST | Multi-source sentiment analysis |
| `/api/analyze-text` | POST | Analyze single text |
| `/api/analyze-csv` | POST | Batch CSV analysis |
| `/api/health` | GET | API health check |

---
## ▶️ Running the Application


```bash
cd backend
pip install -r requirements.txt
python app.py



cd frontend
npm install
npm start

