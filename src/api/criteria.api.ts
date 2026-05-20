import { api } from "./base";

export const getCriteria = () => {

    return api.get("/criteria")

}