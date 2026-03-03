# 🧠 Multi-Source Sentiment Analysis Platform

AI-powered full-stack web application that analyzes sentiment from **Reddit, News, CSV files, and custom text** using multiple NLP and Machine Learning algorithms.

Built with **React + Flask + Scikit-Learn + NLTK**

---

## 📸 Screenshots

### 🔎 Dashboard
![Dashboard](images/dashboard.png)

---

### 📊 Analysis Results
![Results](images/results.png)

---

### 📁 CSV Upload & Metrics
![CSV Analysis](images/csv.png)

---

## 🚀 Features

- 🔴 Reddit sentiment analysis  
- 📰 News article sentiment analysis  
- ✍️ Real-time custom text analysis  
- 📊 CSV batch processing (up to 1000 rows)  
- 🤖 Multi-algorithm ensemble prediction  
- 📈 Accuracy, Precision, Recall, F1 Score  
- 🤝 Algorithm agreement scoring  

---

## 🤖 Algorithms Used

- VADER (NLTK)
- TextBlob
- Logistic Regression
- Naive Bayes
- Random Forest
- Voting Ensemble Classifier

---

## 🏗 Tech Stack

### Frontend
- React
- Tailwind CSS
- Lucide React Icons

### Backend
- Flask
- Scikit-learn
- NLTK
- TextBlob
- Pandas
- PRAW (Reddit API)
- News API
- Gunicorn (Production)

---

## ⚙️ Local Setup

### 1️⃣ Backend Setup

```bash
cd backend
pip install -r requirements.txt
python app.py
Backend runs at:

http://localhost:5001

### 2️⃣ Frontend Setup
cd frontend
npm install
npm start


Frontend runs at:

http://localhost:3000

### 🔑 Environment Variables

Create a .env file inside the backend folder:

NEWS_API_KEY=your_news_api_key
REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_client_secret
REDDIT_USER_AGENT=your_user_agent

### 📡 API Endpoints
Endpoint	Method	Description
/api/analyze	POST	Multi-source sentiment analysis
/api/analyze-text	POST	Analyze single text
/api/analyze-csv	POST	Upload CSV for batch analysis
/api/health	GET	API health check
### 🌐 Deployment (Render)
Backend (Web Service)

Build Command:
pip install -r requirements.txt

Start Command:
gunicorn app:app

Frontend (Static Site)

Build Command:
npm install && npm run build

Publish Directory:
build

Update frontend API URL to:

const API_URL = "https://your-backend-name.onrender.com/api";

#### 📂 Project Structure
project-root/
│
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   ├── package.json
│
└── README.md

### 📈 Future Improvements

Sentiment trend visualization

Database integration

Model persistence

User authentication

Additional data sources

