# اتوماتیک سکریپټ د پروژه GitHub ته push کولو لپاره
$githubUser = "Nasibullahbahir"
$repoName = "hsmis-project"

# .gitignore جوړول
@"
# Django / Python
backend/venv/
backend/__pycache__/
backend/db.sqlite3
backend/*.pyc
backend/*.env

# React / Node
frontend/node_modules/
frontend/build/
frontend/.env

# System
.DS_Store
"@ | Out-File -Encoding UTF8 .gitignore

Write-Host ".gitignore created."

# Git initialize
git init
Write-Host "Git initialized."

# ټول فایلونه اضافه کول
git add .
Write-Host "Files added."

# Commit کول
git commit -m "Initial commit: Django backend + React frontend"
Write-Host "Initial commit done."

# Remote اضافه کول
git remote add origin https://github.com/$githubUser/$repoName.git
Write-Host "Remote added: https://github.com/$githubUser/$repoName.git"

# Push کول
git branch -M main
git push -u origin main

Write-Host "Project pushed to GitHub successfully!"
