import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD4hfhVpBgdZqQ0PoqQZ0Yrs8GekrbjBjY",
  authDomain: "bafnatoys-otp.firebaseapp.com",
  projectId: "bafnatoys-otp",
  storageBucket: "bafnatoys-otp.appspot.com",
  messagingSenderId: "417820640865",
  appId: "1:417820640865:web:9675a4a996763b51084c20"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// ✅ Corrected reCAPTCHA setup
export function setupRecaptcha(containerId: string) {
  return new RecaptchaVerifier(
    containerId,            // element ID
    {
      size: "invisible",
      callback: () => {
        console.log("reCAPTCHA solved ✅");
      },
    },
    auth
  );
}

export { signInWithPhoneNumber };
