@echo off
echo Starting High-Precision PDF Text Editing Server...
set PATH=%~dp0server\venv\Scripts;%PATH%
python "%~dp0server\pdf_text_server.py"
pause
