import { api } from "./base";

export const getDishes = () => {

    return api.get("/dish")

}