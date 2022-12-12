require("dotenv").config();

import { initializeApp } from "firebase/app";
import {
  Database,
  DataSnapshot,
  get,
  getDatabase,
  ref,
  update
} from "firebase/database";
import { PlayerData, PlayerQueryConfig } from "./database.model";

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "lrn-ngt.firebaseapp.com",
  databaseURL: "https://lrn-ngt-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "lrn-ngt",
  storageBucket: "lrn-ngt.appspot.com",
  messagingSenderId: "355875343024",
  appId: "1:355875343024:web:7693a3c7b9d40a84d78975"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database: Database = getDatabase(app);

//todo implement API for creating users / clients
//todo at first there will only be `main-client`

export const writePlayerData = (
  { clientId, spaceId, playerId }: PlayerQueryConfig,
  data: Partial<PlayerData>
): Promise<void> =>
  update(
    ref(database, `${clientId}/spaces/${spaceId}/players/${playerId}`),
    data
  );

export const getPlayerData = (
  { clientId, spaceId, playerId }: PlayerQueryConfig,
  propertyPath?: string
): Promise<DataSnapshot> => {
  if (propertyPath && propertyPath?.[0] !== "/") {
    propertyPath = "/" + propertyPath;
  }
  return get(
    ref(
      database,
      `${clientId}/spaces/${spaceId}/players/${playerId}${propertyPath}`
    )
  );
};

// export const pushToArray = async (data:any): Promise<void> => {
//   const dbRef = ref(database, `${DatabaseGroupings}/${data.playerId}`);
//   push(dbRef).then((newRef) =>
//     set(newRef, {
//       time: data.time,
//       event: data.modal
//         ? `GOT CAKE - X:${data.player.x} Y: ${data.player.y}`
//         : `OPENED MODAL - X:${data.player.x} Y: ${data.player.y}`
//     })
//   );
// };
