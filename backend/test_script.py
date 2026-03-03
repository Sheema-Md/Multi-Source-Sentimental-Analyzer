"""
Test script to verify the CSV endpoint is returning metrics correctly
Run this after starting your Flask server

This creates TWO test CSV files:
1. WITHOUT sentiment column (your current situation)
2. WITH sentiment column (for full metrics)
"""

import requests
import json

# ========== Test 1: CSV WITHOUT sentiment column ==========
test_csv_no_sentiment = """review,user,product
This product is amazing! Love it!,user1,ProductA
Terrible quality worst purchase ever,user2,ProductA
It's okay nothing special,user3,ProductB
Best thing I've ever bought,user4,ProductB
Complete waste of money,user5,ProductA
Excellent product highly recommend,user6,ProductB
Not worth the price,user7,ProductA
Average quality for the cost,user8,ProductB
Super fast shipping great service,user9,ProductA
Stopped working after one week,user10,ProductB
Does what it says good value,user11,ProductA
Poor customer support experience,user12,ProductB
It works fine no complaints,user13,ProductA
Amazing quality exceeded expectations,user14,ProductB
Very disappointed with this,user15,ProductA
"""

# ========== Test 2: CSV WITH sentiment column ==========
test_csv_with_sentiment = """review,sentiment,user,product
This product is amazing! Love it!,Positive,user1,ProductA
Terrible quality worst purchase ever,Negative,user2,ProductA
It's okay nothing special,Neutral,user3,ProductB
Best thing I've ever bought,Positive,user4,ProductB
Complete waste of money,Negative,user5,ProductA
Excellent product highly recommend,Positive,user6,ProductB
Not worth the price,Negative,user7,ProductA
Average quality for the cost,Neutral,user8,ProductB
Super fast shipping great service,Positive,user9,ProductA
Stopped working after one week,Negative,user10,ProductB
Does what it says good value,Positive,user11,ProductA
Poor customer support experience,Negative,user12,ProductB
It works fine no complaints,Neutral,user13,ProductA
Amazing quality exceeded expectations,Positive,user14,ProductB
Very disappointed with this,Negative,user15,ProductA
Absolutely love this purchase,Positive,user16,ProductB
Defective arrived broken,Negative,user17,ProductA
Standard quality acceptable,Neutral,user18,ProductB
Five stars highly recommend,Positive,user19,ProductA
Returned it immediately,Negative,user20,ProductB
"""

# Save both files
with open('test_no_sentiment.csv', 'w') as f:
    f.write(test_csv_no_sentiment)
print("✅ Created test_no_sentiment.csv (like your CSV)")

with open('test_with_sentiment.csv', 'w') as f:
    f.write(test_csv_with_sentiment)
print("✅ Created test_with_sentiment.csv (for full metrics)")

# Test both files
def test_csv_file(filename, description):
    print(f"\n{'='*60}")
    print(f"Testing: {description}")
    print(f"{'='*60}")
    
    url = 'http://localhost:5001/api/analyze-csv'
    
    try:
        with open(filename, 'rb') as f:
            files = {'file': (filename, f, 'text/csv')}
            response = requests.post(url, files=files)
        
        print(f"📡 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ SUCCESS! Response received")
            
            if 'metrics' in data:
                print("\n📈 Available Metrics:")
                
                # Check for algorithm_agreement_metrics (works WITHOUT sentiment)
                if 'algorithm_agreement_metrics' in data['metrics']:
                    print("  ✅ algorithm_agreement_metrics (NO sentiment needed)")
                    print(f"     Algorithms: {len(data['metrics']['algorithm_agreement_metrics'])}")
                else:
                    print("  ❌ algorithm_agreement_metrics NOT found")
                
                # Check for model_evaluation (needs sentiment column)
                if 'model_evaluation' in data['metrics']:
                    print("  ✅ model_evaluation (needs sentiment column)")
                    print(f"     Accuracy: {data['metrics']['model_evaluation']['accuracy']:.2%}")
                else:
                    print("  ⚠️  model_evaluation NOT found (needs sentiment column)")
                
                # Check for algorithm_metrics (needs sentiment column)
                if 'algorithm_metrics' in data['metrics']:
                    print("  ✅ algorithm_metrics (needs sentiment column)")
                    print(f"     Algorithms: {len(data['metrics']['algorithm_metrics'])}")
                else:
                    print("  ⚠️  algorithm_metrics NOT found (needs sentiment column)")
                    
        else:
            print(f"❌ ERROR: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Cannot connect to Flask server")
        print("Make sure the server is running on http://localhost:5001")
    except Exception as e:
        print(f"❌ ERROR: {e}")

# Run tests
print("\n" + "="*60)
print("🧪 TESTING CSV ANALYSIS")
print("="*60)

test_csv_file('test_no_sentiment.csv', 'CSV WITHOUT sentiment (like yours)')
test_csv_file('test_with_sentiment.csv', 'CSV WITH sentiment (full metrics)')

print("\n" + "="*60)
print("✅ TESTING COMPLETE")
print("="*60)
print("\n💡 Tips:")
print("   - Use test_no_sentiment.csv to test like your current CSV")
print("   - Use test_with_sentiment.csv to see ALL metrics")
print("   - Upload these files in your React app to verify frontend works")