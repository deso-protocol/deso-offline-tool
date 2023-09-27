import { sendDeso } from "deso-protocol";

sendDeso(
  {
    SenderPublicKeyBase58Check: "",
    RecipientPublicKeyOrUsername: "",
    AmountNanos: 0,
  },
  {
    checkPermissions: false,
  },
)
  .then((res) => {
    console.log("res", res);
  })
  .catch((err) => {
    console.error("err", err);
  });
