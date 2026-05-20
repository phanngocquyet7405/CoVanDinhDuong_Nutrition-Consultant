import { api } from "./base";

export const getFoods = () => {

    return api.get("/food")

}
