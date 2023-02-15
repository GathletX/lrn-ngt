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
import { PlayerData, PlayerQueryConfig, SpaceConfig } from "./database.model";

// https://firebase.google.com/docs/web/setup#available-libraries

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
): Promise<void> => {
  try {
    return update(
      ref(database, `${clientId}/spaces/${spaceId}/players/${playerId}`),
      data
    );
  } catch (e) {
    console.error(e);
    return Promise.reject();
  }
};

export const getPlayerData = (
  { clientId, spaceId, playerId }: PlayerQueryConfig,
  propertyPath?: string
): Promise<PlayerData | any> => {
  try {
    if (propertyPath && propertyPath?.[0] !== "/") {
      propertyPath = "/" + propertyPath;
    }
    return get(
      ref(
        database,
        `${clientId}/spaces/${spaceId}/players/${playerId}${propertyPath}`
      )
    ).then((snapShot: DataSnapshot) => snapShot.val());
  } catch (e) {
    console.error(e);
    return Promise.reject();
  }
};

export const getSpaceConfig = ({
  spaceId,
  clientId
}: Partial<PlayerQueryConfig>): Promise<SpaceConfig> => {
  try {
    return get(ref(database, `${clientId}/spaces/${spaceId}/config`)).then(
      (snapShot: DataSnapshot) => snapShot.val()
    );
  } catch (e) {
    console.error(e);
    return Promise.reject();
  }
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
