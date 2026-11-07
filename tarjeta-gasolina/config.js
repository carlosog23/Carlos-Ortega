/* Configuración del servicio de alertas (Firebase).
   Estos datos NO son secretos: Firebase los diseña para ir en la página.
   La seguridad la dan las reglas de Firestore (firestore.rules).
   Mientras FIREBASE_CONFIG sea null, la app funciona sin alertas compartidas. */
self.FIREBASE_CONFIG = {
  apiKey: "AIzaSyBI3QEsbv1R3TtPA8EIc3qkwsQT7Ej5Yp8",
  authDomain: "combustible-supervision-bc.firebaseapp.com",
  projectId: "combustible-supervision-bc",
  storageBucket: "combustible-supervision-bc.firebasestorage.app",
  messagingSenderId: "930360114685",
  appId: "1:930360114685:web:cb002cf2386eedec2b6d94"
};
