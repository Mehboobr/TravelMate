# TravelMate

**TravelMate** is a mobile application built using **React Native** and **Expo**. It helps users manage their travel plans efficiently with a clean UI and responsive design.

---

## 📱 Tech Stack

- **React Native** (Expo)
- **EAS Build** for production-ready APKs
- **Google Maps Integration** (`react-native-maps`)
- **Custom Fonts** and Icons
- **Android & iOS** support

---

## 🚀 Getting Started

### 🔧 Prerequisites

- **Node.js** (18.x recommended)  
  [Download Node.js](https://nodejs.org/)

- **Expo CLI**  
  Install globally using:
  ```bash
  npm install -g expo-cli


**🛠️ Running the Project in VS Code**
**Clone the repository**
Open your terminal and run:
git clone https://github.com/Mehboobr/TravelMate.git
cd TravelMate

**Open the project in VS Code**
code .

**Install dependencies**
npm install

**Start the development server**
npm start

or

expo start
**This opens a Metro Bundler in your browser. Scan the QR code using Expo Go (on Android/iOS) or run it on an emulator.**

**📦 Build the App (APK)**
**To create a preview APK using EAS Build:**
eas build -p android --profile preview

**If you're building for production:**
eas build -p android --profile production

**Make sure you are logged into Expo before running the build:**
eas login