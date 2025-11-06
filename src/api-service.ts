import axios from "axios";
import { toError } from "./utils/error-utils";

export async function fetchGameTitle(appId: string) {
    try {
        const res = await axios.get(`http://store.steampowered.com/api/appdetails/?appids=${appId}`);
        const gameTitle: string = res.data[appId].data.name;
        return gameTitle;
    } catch(err: unknown) {
        const error = toError(err);
        console.log("Error while fetching game title:", error.message);
    }
}
