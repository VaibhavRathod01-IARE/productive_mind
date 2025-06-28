# 🧠 ProductiveMind

**ProductiveMind** is a beautifully designed personal productivity dashboard for students and professionals. It includes features like a Pomodoro Timer, Task Manager, Flashcards, Daily Goals, and Ambient Sounds — all in one place.

Live demo: [GitHub Pages](https://udaisaikiran01.github.io/productive-mind)

---

## 🚀 Features

- 🍅 Pomodoro Timer for focused work sessions
- ✅ Task Management
- 📚 Flashcard system for study
- 🎯 Daily Goals tracker
- 🎵 Ambient Sounds for better focus
- 🌅 Daily Motivational Quotes

---

## 📦 Built With

- **HTML, CSS, JavaScript**
- **Nginx (for Docker image serving)**
- **GitHub Actions** for CI/CD
- **Docker & DockerHub**

---

## 🐳 Docker Support

This project is containerized with Docker. It uses a minimal Nginx server to serve the static site.

### 🔧 Dockerfile

```Dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
