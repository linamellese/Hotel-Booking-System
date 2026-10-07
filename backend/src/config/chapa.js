import { Chapa } from "chapa-nodejs";

const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;
const chapa = new Chapa({
   secretKey: CHAPA_SECRET_KEY,
});

export default chapa;
