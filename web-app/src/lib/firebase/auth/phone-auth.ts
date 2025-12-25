// import {linkWithCredential, PhoneAuthProvider, updatePhoneNumber } from "firebase/auth";
// import { auth } from "./auth";
//
// const provider = new PhoneAuthProvider(auth);
// const verificationId = await provider.verifyPhoneNumber(number, verifier);
// try {
//     const code = ''; // Prompt the user for the verification code
//     await updatePhoneNumber(
//         auth.currentUser,
//         PhoneAuthProvider.credential(verificationId, code));
// } catch (e) {
//     if ((e as FirebaseError)?.code === 'auth/account-exists-with-different-credential') {
//         const cred = PhoneAuthProvider.credentialFromError(e);
//         await linkWithCredential(auth.currentUser, cred);
//     }
// }
//
// // At this point, auth.currentUser.phoneNumber === number.
