import type { Provider } from "..";
import * as soccer from "./soccer";
import * as soccerDetails from "./soccer-details";
import * as cricket from "./cricket";
import * as cricketDetails from "./cricket-details";
import * as basketball from "./basketball";
import * as basketballDetails from "./basketball-details";
import * as f1 from "./f1";
import * as f1Details from "./f1-details";
import * as f1Laps from "./f1-laps";

/*
 * The original, unlicensed sources: BBC Sport (soccer), Cricbuzz (cricket),
 * ESPN + balldontlie (basketball), Jolpica + ESPN (F1). Kept as the default
 * and as the fallback until licensed providers are plugged in. Its JSON
 * output is the contract every other provider must match.
 */
export const provider: Provider = {
  id: "legacy",
  feeds: {
    "soccer": soccer.handler,
    "soccer.details": soccerDetails.handler,
    "cricket": cricket.handler,
    "cricket.details": cricketDetails.handler,
    "basketball": basketball.handler,
    "basketball.details": basketballDetails.handler,
    "f1": f1.handler,
    "f1.details": f1Details.handler,
    "f1.laps": f1Laps.handler,
  },
};
