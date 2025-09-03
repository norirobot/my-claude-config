@echo off
echo Starting Puzzle Trading Bot Web Interface...
cd C:\Users\sintt\puzzle_crypto_analysis
python -m streamlit run app_simple.py --server.port 8501
pause