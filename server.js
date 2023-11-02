const { randomBytes } = require("crypto")
const express = require("express")
const { auth, requiresAuth } = require("express-openid-connect")
const app = express()

//load env values from the .env file
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

app.use(
  auth({
    authRequired: false,
    baseURL: "http://localhost:3002",
    secret: process.env.ENCRYPTION_SECRET || randomBytes(64).toString("hex"),

    clientID: process.env.OAUTH_CLIENT_ID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    clientAuthMethod: "client_secret_post",
    idTokenSigningAlg: "ES256",
    issuerBaseURL: process.env.OAUTH_ISSUER_URL,

    authorizationParams: {
      response_type: "code",
      scope: "openid email offline_access",
    },
  }),
)

// Show the full oidc payload
app.get("/", requiresAuth(), (req, res) => {
  req.oidc.fetchUserInfo().then((userInfo) => {
    res.send(
      `<html lang='en'><body><p>Token, claims and userInfo from Cloudentity as OIDC provider</p><pre><code>${JSON.stringify(
        {
          accessToken: req.oidc.accessToken,
          refreshToken: req.oidc.refreshToken,
          idToken: req.oidc.idToken,
          idTokenClaims: req.oidc.idTokenClaims,
          userInfo,
        },
        null,
        2,
      )}</code></pre></body></html>`,
    )
  })
})

app.listen(3002, function () {
  console.log("Listening on http://localhost:3002")
})
