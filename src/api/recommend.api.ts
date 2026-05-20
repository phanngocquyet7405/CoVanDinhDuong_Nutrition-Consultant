import { api } from "./base";

export const runDSS = (weights: number[]) => {

    return api.post("/recommend", {
        weights
    })

}