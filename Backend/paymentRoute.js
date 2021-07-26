require("dotenv").config();
const formidable = require("formidable");
const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const http = require("http");
const https = require("https");
const PaytmChecksum = require("paytmchecksum");

router.post("/callback", () => {
  let callbackResponse = "";

  req
    .on("error", (err) => {
      console.error(err.stack);
    })
    .on("data", (chunk) => {
      callbackResponse += chunk;
    })
    .on("end", () => {
      let data = qs.parse(callbackResponse);
      console.log(data);

      data = JSON.parse(JSON.stringify(data));

      const paytmChecksum = data.CHECKSUMHASH;

      var isVerifySignature = PaytmChecksum.verifySignature(
        data,
        process.env.PAYTM_MERCHANT_KEY,
        paytmChecksum
      );
      if (isVerifySignature) {
        console.log("Checksum Matched");

        var paytmParams = {};

        paytmParams.body = {
          mid: process.env.PAYTM_MERCHANT_KEY,
          orderId: "cccccc1234",
        };

        PaytmChecksum.generateSignature(
          JSON.stringify(paytmParams.body),
          process.env.PAYTM_MERCHANT_KEY
        ).then(function (checksum) {
          paytmParams.head = {
            signature: checksum,
          };

          var post_data = JSON.stringify(paytmParams);

          var options = {
            /* for Staging */
            hostname: "securegw-stage.paytm.in",

            /* for Production */
            // hostname: 'securegw.paytm.in',

            port: 443,
            path: "/v3/order/status",
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Content-Length": post_data.length,
            },
          };

          // Set up the request
          var response = "";
          var post_req = https.request(options, function (post_res) {
            post_res.on("data", function (chunk) {
              response += chunk;
            });

            post_res.on("end", function () {
              console.log("Response: ", response);
              res.write(response);
              res.end();
            });
          });

          // post the data
          post_req.write(post_data);
          post_req.end();
        });
      } else {
        console.log("Checksum Mismatched");
      }
    });
});

router.post("/payment", (req, res) => {
  const { amount, email } = req.body;

  /* import checksum generation utility */
  const totalAmount = JSON.stringify(amount);
  // var params = {};
  // (params["MID"] = process.env.PAYTM_MID),
  //   (params["WEBSITE"] = process.env.PAYTM_WEBSITE),
  //   (params["CHANNEL_ID"] = process.env.PAYTM_CHANNEL_ID),
  //   (params["INDUSTRY_TYPE_ID"] = process.env.PAYTM_INDUSTRY_TYPE_ID),
  //   (params["ORDER_ID"] = "1234"),
  //   (params["TXN_AMOUNT"] = totalAmount),
  //   (params["CALLBACK_URL"] = "http://localhost:5000/api/callback"),
  //   (params["EMAIL"] = email),
  //   (params["MOBILE_NO"] = "6386620894");

  var paytmParams = {};

  paytmParams.body = {
    requestType: "NATIVE_SUBSCRIPTION",
    mid: process.env.PAYTM_MID,
    websiteName: "WEBSTAGING",
    orderId: "cccccc1234",
    callbackUrl: "https://localhost:5000/api/callback",
    subscriptionAmountType: "FIX",
    subscriptionFrequency: "2",
    subscriptionFrequencyUnit: "MONTH",
    subscriptionExpiryDate: "2031-05-20",
    subscriptionEnableRetry: "1",
    txnAmount: {
      value: "1.00",
      currency: "INR",
    },
    userInfo: {
      custId: "CUST_001",
    },
  };
  var paytmChecksum = PaytmChecksum.generateSignature(
    JSON.stringify(paytmParams.body),
    process.env.PAYTM_MERCHANT_KEY
  );
  paytmChecksum
    .then(function (checksum) {
      paytmParams.head = {
        signature: checksum,
      };

      var post_data = JSON.stringify(paytmParams);
      var options = {
        hostname: "securegw-stage.paytm.in",
        port: 443,
        path: `/subscription/create?mid=${process.env.PAYTM_MID}&orderId=cccccc1234`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": post_data.length,
        },
      };

      var response = "";
      var post_req = https.request(options, function (post_res) {
        post_res.on("data", function (chunk) {
          response += chunk;
          console.log(paytmParams, response);
        });

        post_res.on("end", function () {
          response = JSON.parse(response);
          console.log("txnToken:", response);

          res.writeHead(200, { "Content-Type": "text/html" });
          res.write(`<html>
                    <head>
                        <title>Show Payment Page</title>
                    </head>
                    <body>
                        <center>
                            <h1>Please do not refresh this page...</h1>
                        </center>
                        <form method="post" action="https://securegw-stage.paytm.in/theia/api/v1/showPaymentPage?mid=${process.env.PAYTM_MID}&orderId=1234" name="paytm">
                            <table border="1">
                                <tbody>
                                    <input type="hidden" name="mid" value="${process.env.PAYTM_MID}">
                                        <input type="hidden" name="orderId" value="cccccc1234">
                                        <input type="hidden" name="txnToken" value="${response.body.txnToken}">
                             </tbody>
                          </table>
                                        <script type="text/javascript"> document.paytm.submit(); </script>
                       </form>
                    </body>
                 </html>`);
          res.end();
        });
      });
      post_req.write(post_data);
      post_req.end();
      // res.send(response);
      console.log("hhi");
      // console.log(paytmParams);
    })
    .catch(function (error) {
      console.log("hello", error);
    });
});

module.exports = router;
