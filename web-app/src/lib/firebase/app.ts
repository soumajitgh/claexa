import {initializeApp} from 'firebase/app';
import {firebaseConfig} from './config.ts';

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

export {app};