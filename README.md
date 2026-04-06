This project was done for exploratory purposes to refine and get better with Node JS.  By no means is it complete - In fact you will find errors on runtime due to the app.post('/login) route and issues with the accessToken that is to be generated.  

This project is strictly done to measure progress.

UPDATE 2026-01-11

I've since updated this program and it retains functionality on the backend with react implementation.  It gets to the login screen and will authenticate via Node JS - that's as far as I've reached so far.  I may come back to finish and implement a registration page with a welcome screen on successful login.

UPDATE 2026-02-15

I've since added proper login - access token functionality, authentication, registration.  Will focus more on the JWT side of things now adding refresh token and a forgot password functionality - hope to add proper middleware rather than just dumping all on index.js

UPDATE 2026-04-06

Changed MongoDB schema to include refreshToken and RefreshToken expiry.  Have new resetPassword.jsx and forgotPassword.jsx files included.
Primary function of the NewPassword.jsx is to have token appended to it's URL when clicking on the reset link via email.  
Primary function of the resetPassword.jsx is to have 

New issue now lies in accessToken remaining the same, for some reason the same userID is constantly being duplicated across records.  Will need to resolve this.
