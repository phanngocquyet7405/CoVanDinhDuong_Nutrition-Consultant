import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom"

import Dashboard from "./pages/Dashboard"
import Food from "./pages/Food"
import Dish from "./pages/Dish"
import Criteria from "./pages/Criteria"
import Recommend from "./pages/Recommend"

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Dashboard />}
        />

        <Route
          path="/food"
          element={<Food />}
        />

        <Route
          path="/dish"
          element={<Dish />}
        />

        <Route
          path="/criteria"
          element={<Criteria />}
        />

        <Route
          path="/recommend"
          element={<Recommend />}
        />

      </Routes>

    </BrowserRouter>

  )

}

export default App