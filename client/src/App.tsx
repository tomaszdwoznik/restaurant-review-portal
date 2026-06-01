import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import RestaurantList from './pages/RestaurantList';
import Login from './pages/Login';
import RestaurantDetail from './pages/RestaurantDetail';
import AddRestaurant from './pages/AddRestaurant';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<RestaurantList />} />
                <Route path="/login" element={<Login />} />
                <Route path="/restaurants/new" element={<ProtectedRoute><AddRestaurant /></ProtectedRoute>} />
                <Route path="/restaurants/:id" element={<RestaurantDetail />} />
            </Route>
        </Routes>
    );
}